const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/dbConnect');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const PORT = process.env.PORT || 8080;
console.log(`🚀 Server will start on port: ${PORT}`);

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) :
    ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'https://qumail-7epm.onrender.com'];

console.log('🔧 CORS: Allowed origins:', allowedOrigins);
console.log('🔧 CORS: NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 CORS: PORT:', process.env.PORT);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Add this to parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true })); // Add this to parse URL-encoded bodies
app.use('/auth/', authRoutes);
app.use('/email/', emailRoutes); // Add email routes back for sending functionality

app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database connection and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the server after successful DB connection
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🌐 Access your application at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the server
startServer();
