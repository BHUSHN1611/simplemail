const express = require('express');
const Router = express.Router();
const { googleAuth, appPasswordLogin } = require('../controllers/authController');

// OAuth (legacy) endpoint
Router.get('/google', googleAuth);

// App password / IMAP login: accepts { email, appPassword, imapHost? }
Router.post('/app-login', appPasswordLogin);

module.exports = Router;