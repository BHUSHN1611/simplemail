const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../models/userModel');
import nodemailer from "nodemailer"

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture } = userRes.data;
        // console.log(userRes);
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
            });
        }
       
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        res.status(200).json({
            message: 'success',
            token,
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "you@gmail.com",
    clientId: "GOOGLE_CLIENT_ID",
    clientSecret: "GOOGLE_CLIENT_SECRET",
    refreshToken: "REFRESH_TOKEN",
    accessToken: "ACCESS_TOKEN"
  }
});

await transporter.sendMail({
  from: "you@gmail.com",
  to: "friend@gmail.com",
  subject: "Hello via OAuth",
  text: "This is a secure mail using OAuth2!"
});

