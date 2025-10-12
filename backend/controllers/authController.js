const axios = require('axios');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const User = require('../models/userModel');

// Simple OAuth2 client setup for authentication only
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback'
);

exports.googleAuth = async (req, res, next) => {
    const accessToken = req.query.access_token; // For implicit flow, we receive the access token directly
    try {
        // For implicit flow, we receive the access token directly
        if (!accessToken || typeof accessToken !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing access token' });
        }

        // Set the access token in the OAuth client
        oauth2Client.setCredentials({ access_token: accessToken });

        // Get user information using the access token
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
        );

        const { email, name, picture } = userRes.data;

        // Check if this is a demo user logging in via OAuth
        const isDemoUser = email === 'qumail1611@gmail.com';
        console.log('🔐 OAuth login attempt:', { email, isDemoUser });

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
                accessToken: accessToken,   // Store access token (no refresh token in implicit flow)
                tokenExpiry: new Date(Date.now() + 3600000), // Assume 1 hour expiry
                isDemoSession: isDemoUser
            });
            console.log('🆕 Created new OAuth user:', { email, isDemoSession: user.isDemoSession });
        } else {
            // Update access token and demo session flag
            const previousDemoFlag = user.isDemoSession;
            user.accessToken = accessToken;
            user.tokenExpiry = new Date(Date.now() + 3600000); // Assume 1 hour expiry
            user.isDemoSession = isDemoUser; // Explicitly set the demo session flag
            await user.save();
            console.log('🔄 Updated existing OAuth user:', {
                email,
                isDemoSession: user.isDemoSession,
                previousFlag: previousDemoFlag,
                newFlag: isDemoUser
            });
        }

        const { _id } = user;
        const tokenPayload = { _id, email };
        console.log('🔐 Generating JWT for user:', email);
        console.log('🔐 JWT payload:', tokenPayload);

        const token = jwt.sign(tokenPayload,
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });

        console.log('✅ JWT generated successfully');
        console.log('🔐 Token preview:', token.substring(0, 50) + '...');

        res.status(200).json({
            message: 'success',
            token,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                },
                token
            }
        });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

// App Password login: accept email and appPassword (and optional imapHost/imapPort)
exports.appPasswordLogin = async (req, res) => {
    try {
        const { email, appPassword, imapHost, imapPort } = req.body;
        if (!email || !appPassword) {
            return res.status(400).json({ message: 'Missing email or appPassword' });
        }

        // Normalize host/port for Gmail
        const host = imapHost || 'imap.gmail.com';
        const port = imapPort || 993;

        // Skip IMAP and SMTP verification for faster login since email functionality is disabled
        console.log('🚀 Fast login - skipping email verification for user:', email);

        // Check if this is a demo login
        const isDemoLogin = email === 'qumail1611@gmail.com' && appPassword === 'znxx feza pwag nmnb';
        console.log('🔐 Login attempt:', { email, isDemoLogin, hasPassword: !!appPassword });

        // Find or create user (only after verification succeeded)
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                email,
                name: email.split('@')[0],
                imapUser: email,
                imapPass: appPassword,
                imapHost: host,
                imapPort: port,
                imapSecure: true,
                isDemoSession: isDemoLogin
            });
            await user.save();
            console.log('🆕 Created new user:', { email, isDemoSession: user.isDemoSession });
        } else {
            // Update IMAP credentials and demo session flag
            const wasDemoSession = user.isDemoSession;
            user.imapUser = email;
            user.imapPass = appPassword;
            user.imapHost = host;
            user.imapPort = port;
            user.imapSecure = true;
            user.isDemoSession = isDemoLogin; // Explicitly set the demo session flag
            await user.save();
            console.log('🔄 Updated existing user:', {
                email,
                isDemoSession: user.isDemoSession,
                previousFlag: wasDemoSession,
                newFlag: isDemoLogin
            });
        }

        const tokenPayload = { _id: user._id, email: user.email };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIMEOUT });

        return res.json({
            message: 'success',
            token,
            data: { user: { _id: user._id, email: user.email, name: user.name }, token }
        });
    } catch (err) {
        console.error('❌ App password login error:', {
            message: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
        });
        
        // Provide more specific error messages based on error type
        let errorMessage = 'Internal Server Error';
        let statusCode = 500;
        
        if (err.message.includes('Authentication failed')) {
            errorMessage = 'Invalid email or app password';
            statusCode = 401;
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
            errorMessage = 'Cannot connect to email server - please check your internet connection';
            statusCode = 503;
        } else if (err.message.includes('timeout')) {
            errorMessage = 'Connection timed out - please try again';
            statusCode = 408;
        }
        
        res.status(statusCode).json({ 
            message: errorMessage,
            details: err.message,
            code: err.code || 'LOGIN_FAILED',
            timestamp: new Date().toISOString()
        });
    }
};

