const express = require('express');
const Router = express.Router();
const { sendEmail } = require('../controllers/emailController');

Router.post('/send', sendEmail);

module.exports = Router;