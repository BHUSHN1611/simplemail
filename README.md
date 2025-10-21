# 🔐 Qumail - Quantum Secure Mailing System

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://qumail-7cpm.onrender.com)
[![Backend](https://img.shields.io/badge/backend-deployed-blue)](https://qumail-backend-4s2a.onrender.com)
[![License](https://img.shields.io/badge/license-ISC-orange)](LICENSE)

A robust email client application featuring **Post-Quantum Cryptography** with simulated **Quantum Key Distribution (QKD)** for next-generation email security.

---

## 🌟 Features

### 🔒 Security Features
- **Quantum Key Integration**: Using ETSI GS QKD 014 APIs to fetch simulated quantum keys
- **Post-Quantum Cryptography (PQC)**: Protection against quantum computing threats
- **Multi-Level Encryption**: 4 security modes (OTP, Quantum-aided AES, PQC, Standard)
- **AES Message Encryption**: End-to-end encryption for emails and attachments
- **Application Layer Security**: Client-side encryption before transmission

### 📧 Email Features
- Gmail integration via IMAP and SMTP
- Send and receive emails securely
- Modern, intuitive email client interface
- Real-time email fetching
- Compose emails with rich formatting
- Email preview and full view

### 🎨 User Interface
- Modern dark-themed UI
- Responsive design for all devices
- Animated network visualization
- Real-time status notifications
- Minimizable compose window
- Smooth transitions and animations

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Express Backend│◄───────►│  Gmail (IMAP)  │
│   (Vite + TW)   │   REST  │   (Node.js)     │   API   │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Quantum Key   │
                            │   Distribution  │
                            │   (Simulated)   │
                            └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Gmail account** with:
  - 2-Factor Authentication enabled
  - App Password generated
  - IMAP access enabled

### 📝 Gmail Setup (Required)

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character password (remove spaces)

3. **Enable IMAP**:
   - Open Gmail Settings → Forwarding and POP/IMAP
   - Enable IMAP access

---

## 💻 Local Development

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (optional)
echo "PORT=5000" > .env
echo "FRONTEND_URL=http://localhost:5173" >> .env

# Start the server
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🌐 Deployment on Render

### Backend Deployment

1. **Create New Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Settings**:
   - **Name**: `qumail-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Environment Variables** (optional):
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

4. **Deploy**: Click "Create Web Service"

### Frontend Deployment

1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Settings**:
   - **Name**: `qumail-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**: Click "Create Static Site"

### Update CORS Configuration

After deployment, update `backend/server.js`:

```javascript
app.use(cors({
  origin: "https://your-frontend-url.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
}));
```

And update API URLs in frontend components to match your backend URL.

---

## 🔧 Configuration

### Backend Configuration (`backend/package.json`)

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

### Frontend Configuration (`frontend/vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

---

## 📡 API Endpoints

### Authentication

#### `POST /login`
Login with Gmail credentials

**Request:**
```json
{
  "gmail": "your-email@gmail.com",
  "appPassword": "your-app-password"
}
```

**Response:**
```json
{
  "success": true,
  "name": "your-name",
  "sessionId": "1234567890"
}
```

### Email Operations

#### `POST /fetch-mails`
Fetch emails from inbox

**Request:**
```json
{
  "email": "your-email@gmail.com",
  "appPassword": "your-app-password",
  "maxEmails": 20
}
```

**Response:**
```json
{
  "success": true,
  "mails": [
    {
      "id": 1,
      "subject": "Email Subject",
      "from": "sender@example.com",
      "date": "2025-01-01 12:00:00",
      "snippet": "Email preview..."
    }
  ]
}
```

#### `POST /send-email`
Send an email

**Request:**
```json
{
  "email": "your-email@gmail.com",
  "appPassword": "your-app-password",
  "to": "recipient@example.com",
  "subject": "Subject",
  "body": "Email body"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "<message-id>",
  "message": "Email sent successfully"
}
```

### Health Check

#### `GET /health`
Check backend status

**Response:**
```json
{
  "status": "healthy"
}
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **IMAP** - Email retrieval
- **Nodemailer** - Email sending
- **Mailparser** - Email parsing
- **CORS** - Cross-origin support

---

## 📁 Project Structure

```
qumail/
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard.jsx              # Main dashboard
│   │   │   ├── EmailClient.jsx            # Email list & detail
│   │   │   ├── Loginscreen.jsx            # Login page
│   │   │   ├── HeroSection.jsx            # Landing hero
│   │   │   ├── Footer.jsx                 # Footer with team info
│   │   │   ├── Navbar.jsx                 # Navigation
│   │   │   ├── GradientBackground.jsx     # Background component
│   │   │   └── NetworkFlowVisualization.jsx # Animation
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── vite.config.js      # Vite configuration
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
│
└── README.md               # This file
```

---

## 🐛 Troubleshooting

### "Invalid credentials" Error

1. **Check App Password**: Ensure no spaces in the password
2. **Verify 2FA**: Must be enabled on Google Account
3. **IMAP Access**: Enable IMAP in Gmail settings
4. **Try New Password**: Generate a fresh app password

### "CORS Error"

1. Update backend CORS origin to match your frontend URL
2. Ensure credentials: true is set
3. Check that both services are deployed and running

### "404 Not Found"

1. Verify backend is deployed and running (check `/health` endpoint)
2. Check API URLs in frontend match backend deployment
3. Review Render logs for startup errors

### Email Not Fetching

1. Check IMAP is enabled in Gmail
2. Verify app password is correct
3. Check backend logs for specific error messages

---

## 👥 Team

- **Yash Gabhale**
- **Bhushan Jadhav**
- **Abhishek Yadav**
- **Rahul Singh**
- **Riddhi Makwana**
- **Faizan Patel**

---

## 🔮 Future Enhancements

- [ ] Full Quantum Key Distribution implementation
- [ ] End-to-end encryption visualization
- [ ] Multi-folder support (Sent, Drafts, Spam)
- [ ] Email search functionality
- [ ] Attachment support
- [ ] Email threading
- [ ] Dark/Light theme toggle
- [ ] Mobile app version
- [ ] Email templates
- [ ] Calendar integration

---

## 📄 License

This project is licensed under the ISC License.

---

## 🔗 Links

- **Live Demo**: [https://qumail-7cpm.onrender.com](https://qumail-7cpm.onrender.com)
- **Backend API**: [https://qumail-backend-4s2a.onrender.com](https://qumail-backend-4s2a.onrender.com)
- **Documentation**: [ETSI GS QKD 014](https://www.etsi.org/deliver/etsi_gs/QKD/001_099/014/01.01.01_60/gs_qkd014v010101p.pdf)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Security Note

This is a demonstration project showcasing post-quantum cryptography concepts. For production use:
- Implement proper key management
- Use secure storage for credentials
- Add rate limiting and authentication
- Implement proper session management
- Add comprehensive error handling
- Use environment variables for all secrets

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact the team members
- Check the troubleshooting section

---

**Built with ❤️ using Post-Quantum Cryptography**

*Powered by next-generation security for the quantum era*
