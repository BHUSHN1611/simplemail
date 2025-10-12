const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Send email
exports.sendEmail = async (req, res) => {
    try {
        console.log('📧 Email send request received');
        console.log('📧 Request headers:', req.headers);
        console.log('📧 Request body:', req.body);

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.error('❌ No authorization header provided');
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('❌ No token provided in authorization header');
            return res.status(401).json({ error: 'No token provided in authorization header' });
        }

        // Validate token
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            return res.status(401).json({
                error: 'Invalid token format',
                details: `Expected 3 parts separated by dots, got ${tokenParts.length}`
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development-only');
            console.log('✅ JWT token verified for user:', decoded.email);
        } catch (jwtError) {
            console.error('❌ JWT verification failed:', jwtError.message);
            return res.status(401).json({
                error: 'Token verification failed',
                details: jwtError.message
            });
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            console.error('❌ User not found with ID:', decoded._id);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('✅ User found:', user.email);

        // Fix isDemoSession field for existing users if it's not properly set
        if (user.email === 'qumail1611@gmail.com' && user.isDemoSession !== true) {
            user.isDemoSession = true;
            await user.save();
            console.log('🔧 Fixed isDemoSession flag for demo user:', user.email);
        } else if (user.email !== 'qumail1611@gmail.com' && user.isDemoSession !== false) {
            user.isDemoSession = false;
            await user.save();
            console.log('🔧 Fixed isDemoSession flag for regular user:', user.email);
        }

        const { to, subject, body} = req.body;

        // Determine which credentials to use for sending
        let emailUser, emailPassword, mailFrom;

        console.log('🔍 Email sending request for user:', {
            email: user.email,
            isDemoSession: user.isDemoSession,
            hasCredentials: !!(user.imapUser && user.imapPass),
            imapUser: user.imapUser
        });

        // Check if this is a demo session
        // Multiple fallback checks to ensure proper detection
        const isDemoSession = user.isDemoSession === true ||
                            (user.email === 'qumail1611@gmail.com') ||
                            (user.imapUser === 'qumail1611@gmail.com' && user.imapPass === 'znxx feza pwag nmnb');

        if (isDemoSession) {
            // This is a demo session - always use demo credentials
            emailUser = 'qumail1611@gmail.com';
            emailPassword = 'znxx feza pwag nmnb';
            mailFrom = user.email;
            console.log('📧 Using demo credentials for demo session:', user.email);
        } else if (user.imapUser && user.imapPass && user.imapUser !== 'qumail1611@gmail.com') {
            // This is a regular user session with their own credentials - use their stored credentials
            emailUser = user.imapUser;
            emailPassword = user.imapPass;
            mailFrom = user.email;
            console.log('📧 Using user credentials for email sending:', user.email, 'from:', emailUser);
        } else {
            // Fallback for users without proper credentials or demo users with wrong setup
            emailUser = 'qumail1611@gmail.com';
            emailPassword = 'znxx feza pwag nmnb';
            mailFrom = user.email;
            console.log('📧 Using fallback demo credentials for user:', user.email, 'reason: no valid user credentials');
        }

        let transporter;
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPassword
            }
        });

        const mailOptions = {
            from: mailFrom,
            to,
            subject,
            html: body
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', {
            messageId: result.messageId,
            from: mailFrom,
            to: to,
            subject: subject
        });

        res.json({
            success: true,
            messageId: result.messageId,
            message: 'Email sent successfully!'
        });

    } catch (error) {
        console.error('❌ Send email error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Provide more specific error messages based on error type
        let errorMessage = 'Failed to send email';
        let statusCode = 500;

        if (error.message.includes('Authentication failed')) {
            errorMessage = 'Email authentication failed - please check your credentials';
            statusCode = 401;
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Cannot connect to email server - please check your internet connection';
            statusCode = 503;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Email sending timed out - please try again';
            statusCode = 408;
        } else if (error.code === 'EAUTH') {
            errorMessage = 'Invalid email credentials - please check your app password';
            statusCode = 401;
        }

        res.status(statusCode).json({
            error: errorMessage,
            details: error.message,
            code: error.code || 'EMAIL_SEND_FAILED',
            timestamp: new Date().toISOString()
        });
    }
};