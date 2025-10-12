# Qumail - Gmail Integration Application

A modern email client application that supports both Gmail OAuth and App Password authentication for sending and receiving emails.

## 🚀 Features

- **Dual Authentication**: Support for both Gmail OAuth and App Password authentication
- **IMAP Integration**: Direct IMAP access for reading Gmail messages
- **SMTP Support**: Send emails using Gmail SMTP with app passwords
- **Modern UI**: React-based frontend with responsive design
- **Docker Support**: Containerized deployment with Docker Compose
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Security First**: Environment-based configuration with no hardcoded credentials

## 📋 Prerequisites

### Gmail Account Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Save the 16-character password (you'll need it for configuration)

### System Requirements
- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Docker and Docker Compose (optional)

## 🛠️ Installation & Setup

### Option 1: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd QumailV1
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Option 2: Docker Deployment

1. **Clone and configure environment**
   ```bash
   git clone <repository-url>
   cd QumailV1
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## ⚙️ Environment Configuration

Create `backend/.env` with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/qumail

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_TIMEOUT=24h

# Google OAuth Configuration (optional, for OAuth users)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Server Configuration
PORT=8080
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000

# Gmail Configuration (for demo purposes - use app passwords in production)
GMAIL_DEMO_EMAIL=your-demo-email@gmail.com
GMAIL_DEMO_APP_PASSWORD=your-demo-app-password-here

# OAuth Redirect URIs (comma-separated for multiple environments)
OAUTH_REDIRECT_URIS=http://localhost:8080/auth/google,https://yourdomain.com/auth/google
```

### Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/qumail` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your-super-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional | `your-client-secret` |
| `GMAIL_DEMO_EMAIL` | Demo Gmail address | Optional | `demo@gmail.com` |
| `GMAIL_DEMO_APP_PASSWORD` | Demo app password | Optional | `abcdefghijklmnop` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Yes | `http://localhost:5173,https://yourdomain.com` |
| `OAUTH_REDIRECT_URIS` | OAuth redirect URIs | Optional | `http://localhost:8080/auth/google` |

## 🚀 Running the Application

### Local Development

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Automated Tests

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Manual Testing

1. Follow the comprehensive manual test checklist in `MANUAL_TEST_CHECKLIST.md`
2. Test Gmail app password authentication
3. Verify email sending and receiving functionality
4. Test error handling scenarios

## 📱 Usage

### Gmail App Password Login

1. **Open the application** in your browser
2. **Click "Login"** button
3. **Enter your Gmail address** (e.g., `yourname@gmail.com`)
4. **Enter your app password** (16-character password from Google Account settings)
5. **Click "Sign in"**

### Sending Emails

1. **After login**, navigate to the compose section
2. **Enter recipient email address**
3. **Add subject and message**
4. **Click send**

### Reading Emails

1. **Navigate to inbox** after login
2. **View your Gmail messages**
3. **Click on messages** to read full content

## 🔧 API Endpoints

### Authentication
- `POST /auth/app-login` - Login with Gmail app password
- `GET /auth/google` - OAuth login (legacy)

### Email Operations
- `POST /email/send` - Send email
- `GET /email/inbox` - Get inbox messages
- `GET /email/message/:id` - Get specific message

### Health Check
- `GET /test` - CORS test endpoint

## 🐛 Troubleshooting

### Common Issues

#### "Authentication failed" Error
- **Cause**: Invalid app password or 2FA not enabled
- **Solution**: 
  - Verify 2FA is enabled on Gmail account
  - Generate new app password
  - Ensure using app password, not regular password

#### "CORS blocked request" Error
- **Cause**: Frontend URL not in allowed origins
- **Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

#### "No email credentials configured" Error
- **Cause**: Missing demo credentials or user credentials
- **Solution**: 
  - Set `GMAIL_DEMO_EMAIL` and `GMAIL_DEMO_APP_PASSWORD` in `.env`
  - Or login with app password to use user credentials

#### IMAP Connection Timeouts
- **Cause**: Network issues or Gmail IMAP disabled
- **Solution**:
  - Check internet connection
  - Verify Gmail IMAP settings are enabled
  - Try different IMAP host/port combinations

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 🔒 Security Considerations

- **Never commit `.env` files** to version control
- **Use strong JWT secrets** in production
- **Enable HTTPS** in production environments
- **Regularly rotate app passwords**
- **Monitor access logs** for suspicious activity

## 📊 Monitoring

### Health Checks
- Backend health: `GET http://localhost:8080/test`
- Database connection: Check MongoDB logs
- Email connectivity: Test with manual email send

### Logs
- Backend logs: Console output or Docker logs
- Frontend logs: Browser developer console
- Database logs: MongoDB logs

## 🚀 Production Deployment

### Environment Setup
1. **Use production MongoDB** (Atlas, etc.)
2. **Set strong JWT secret**
3. **Configure production CORS origins**
4. **Enable HTTPS**
5. **Set up monitoring and logging**

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

- **Enable email caching** for better performance
- **Implement rate limiting** for email operations
- **Use connection pooling** for database connections
- **Optimize IMAP queries** for large inboxes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review the manual test checklist
3. Check existing issues
4. Create a new issue with detailed information

---

**Happy Emailing! 📧**
