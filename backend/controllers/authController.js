const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client, SCOPES } = require('../utils/googleClient');
const User = require('../models/userModel');

exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        
        const { email, name, picture } = userRes.data;
        
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
                refreshToken: googleRes.tokens.refresh_token, // Store refresh token
                accessToken: googleRes.tokens.access_token,   // Store access token
                tokenExpiry: new Date(googleRes.tokens.expiry_date) // Store expiry
            });
        } else {
            // Update tokens
            user.refreshToken = googleRes.tokens.refresh_token || user.refreshToken;
            user.accessToken = googleRes.tokens.access_token;
            user.tokenExpiry = new Date(googleRes.tokens.expiry_date);
            await user.save();
        }
       
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        
        res.status(200).json({
            message: 'success',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            },
        });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};