const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
require('./models/dbConnect');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const PORT = process.env.PORT || 8080;

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) :
    ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors());

app.use(express.json()); // Add this to parse JSON bodies
app.use('/auth/', authRoutes);
app.use('/email/', emailRoutes); // Add email routes back for sending functionality

app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on ${PORT}`)
});
