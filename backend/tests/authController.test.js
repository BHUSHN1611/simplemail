const request = require('supertest');
const jwt = require('jsonwebtoken');
const { appPasswordLogin } = require('../controllers/authController');
const User = require('../models/userModel');

// Mock dependencies
jest.mock('../models/userModel');
jest.mock('imap-simple');
jest.mock('nodemailer');

const Imap = require('imap-simple');
const nodemailer = require('nodemailer');

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_TIMEOUT = '1h';
  });

  describe('appPasswordLogin', () => {
    const mockReq = {
      body: {
        email: 'test@gmail.com',
        appPassword: 'test-app-password',
        imapHost: 'imap.gmail.com',
        imapPort: 993
      }
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    it('should successfully authenticate with valid credentials', async () => {
      // Mock successful IMAP connection
      const mockConnection = {
        openBox: jest.fn().mockResolvedValue(true),
        end: jest.fn().mockResolvedValue(true)
      };
      Imap.connect.mockResolvedValue(mockConnection);

      // Mock successful SMTP verification
      const mockTransporter = {
        verify: jest.fn().mockResolvedValue(true)
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      // Mock user creation
      const mockUser = {
        _id: 'user-id',
        email: 'test@gmail.com',
        name: 'test',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(true);
      User.mockImplementation(() => mockUser);

      await appPasswordLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'success',
        token: expect.any(String),
        data: {
          user: {
            _id: 'user-id',
            email: 'test@gmail.com',
            name: 'test'
          },
          token: expect.any(String)
        }
      });
    });

    it('should fail with missing email or app password', async () => {
      const invalidReq = {
        body: {
          email: '',
          appPassword: ''
        }
      };

      await appPasswordLogin(invalidReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Missing email or appPassword'
      });
    });

    it('should fail with invalid IMAP credentials', async () => {
      Imap.connect.mockRejectedValue(new Error('Authentication failed'));

      await appPasswordLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'IMAP authentication failed - check email/app password/IMAP host',
        details: 'Authentication failed'
      });
    });

    it('should fail with invalid SMTP credentials', async () => {
      const mockConnection = {
        openBox: jest.fn().mockResolvedValue(true),
        end: jest.fn().mockResolvedValue(true)
      };
      Imap.connect.mockResolvedValue(mockConnection);

      const mockTransporter = {
        verify: jest.fn().mockRejectedValue(new Error('SMTP authentication failed'))
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      await appPasswordLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'SMTP authentication failed - check email/app password',
        details: 'SMTP authentication failed'
      });
    });

    it('should handle network errors gracefully', async () => {
      Imap.connect.mockRejectedValue(new Error('ENOTFOUND'));

      await appPasswordLogin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Cannot connect to email server - please check your internet connection',
        details: 'ENOTFOUND',
        code: undefined,
        timestamp: expect.any(String)
      });
    });
  });
});
