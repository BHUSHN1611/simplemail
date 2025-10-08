const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
require('./models/dbConnect');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies
app.use('/auth/', authRoutes);
app.use('/email/', emailRoutes); // Add email routes

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});
