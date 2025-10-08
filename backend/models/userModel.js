const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type: String
    },
    refreshToken: {
        type: String
    },
    accessToken: {
        type: String
    },
    tokenExpiry: {
        type: Date
    }
    ,
    // Optional IMAP credentials for non-Google accounts or fallback
    imapUser: {
        type: String
    },
    imapPass: {
        type: String
    },
    imapHost: {
        type: String
    },
    imapPort: {
        type: Number
    },
    imapSecure: {
        type: Boolean
    }
}, { timestamps: true });

const User = mongoose.model('social-login', userSchema);
module.exports = User;
