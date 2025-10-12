const request = require('supertest');
const jwt = require('jsonwebtoken');
const { sendEmail, getEmails } = require('../controllers/emailController');
const User = require('../models/userModel');

// Mock dependencies
jest.mock('../models/userModel');
jest.mock('nodemailer');
jest.mock('imap-simple');
jest.mock('googleapis');

const nodemailer = require('nodemailer');
const Imap = require('imap-simple');
const { google } = require('googleapis');

describe('EmailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.GMAIL_DEMO_EMAIL = 'demo@gmail.com';
    process.env.GMAIL_DEMO_APP_PASSWORD = 'demo-password';
  });

  describe('sendEmail', () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      }
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should send email successfully with user credentials', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: 'user@gmail.com',
        imapPass: 'app-password'
      };
      User.findById.mockResolvedValue(mockUser);

      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'message-id' })
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await sendEmail(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        messageId: 'message-id',
        message: 'Email sent successfully!'
      });
    });

    it('should send email with demo credentials when user has no IMAP credentials', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: null,
        imapPass: null
      };
      User.findById.mockResolvedValue(mockUser);

      const mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'message-id' })
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await sendEmail(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        messageId: 'message-id',
        message: 'Email sent successfully!'
      });
    });

    it('should fail when demo credentials are not configured', async () => {
      delete process.env.GMAIL_DEMO_EMAIL;
      delete process.env.GMAIL_DEMO_APP_PASSWORD;

      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: null,
        imapPass: null
      };
      User.findById.mockResolvedValue(mockUser);

      await sendEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No email credentials configured',
        details: 'Please configure GMAIL_DEMO_EMAIL and GMAIL_DEMO_APP_PASSWORD environment variables or login with app password'
      });
    });

    it('should fail with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await sendEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token verification failed',
        details: 'Invalid token'
      });
    });

    it('should handle email sending errors', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: 'user@gmail.com',
        imapPass: 'app-password'
      };
      User.findById.mockResolvedValue(mockUser);

      const mockTransporter = {
        sendMail: jest.fn().mockRejectedValue(new Error('Authentication failed'))
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await sendEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email authentication failed - please check your credentials',
        details: 'Authentication failed',
        code: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('getEmails', () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer valid-token'
      },
      query: {
        limit: '10',
        q: 'test query'
      }
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should fetch emails successfully via IMAP', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: 'user@gmail.com',
        imapPass: 'app-password',
        imapHost: 'imap.gmail.com',
        imapPort: 993
      };
      User.findById.mockResolvedValue(mockUser);

      const mockConnection = {
        openBox: jest.fn().mockResolvedValue(true),
        search: jest.fn().mockResolvedValue([]),
        end: jest.fn().mockResolvedValue(true)
      };
      Imap.connect.mockResolvedValue(mockConnection);

      await getEmails(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        emails: [],
        nextPageToken: null,
        hasMore: false
      });
    });

    it('should handle IMAP connection errors', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: 'user@gmail.com',
        imapPass: 'app-password',
        imapHost: 'imap.gmail.com',
        imapPort: 993
      };
      User.findById.mockResolvedValue(mockUser);

      Imap.connect.mockRejectedValue(new Error('Authentication failed'));

      await getEmails(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        emails: [],
        error: 'IMAP authentication failed - please check your Gmail app password',
        details: 'Authentication failed',
        code: 'IMAP_CONNECTION_FAILED'
      });
    });

    it('should fallback to Gmail API when IMAP credentials are not available', async () => {
      const mockDecoded = { _id: 'user-id', email: 'user@gmail.com' };
      jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);

      const mockUser = {
        _id: 'user-id',
        email: 'user@gmail.com',
        imapUser: null,
        imapPass: null,
        accessToken: 'access-token',
        tokenExpiry: new Date(Date.now() + 3600000)
      };
      User.findById.mockResolvedValue(mockUser);

      const mockGmail = {
        users: {
          messages: {
            list: jest.fn().mockResolvedValue({
              data: { messages: [], nextPageToken: null }
            })
          }
        }
      };
      google.gmail.mockReturnValue(mockGmail);

      // Mock the getAuthenticatedClient function
      const mockAuthClient = {};
      google.auth.OAuth2.prototype.setCredentials = jest.fn();
      google.auth.OAuth2.prototype.refreshAccessToken = jest.fn().mockResolvedValue({
        credentials: { access_token: 'new-token', expiry_date: Date.now() + 3600000 }
      });

      await getEmails(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        emails: [],
        nextPageToken: null,
        hasMore: false
      });
    });
  });
});
