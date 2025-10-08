const express = require('express');
const Router = express.Router();
const { sendEmail, getEmails, getEmailById } = require('../controllers/emailController');

Router.post('/send', sendEmail);
Router.get('/inbox', getEmails);
Router.get('/message/:id', getEmailById);

module.exports = Router;