const mongoose = require('mongoose');

const DB = process.env.DB_URL || process.env.MONGODB_URI || "mongodb+srv://bhushn:railmadat16@cluster0.aeoisat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log('DB--', DB ? 'Connected to MongoDB' : 'Using fallback DB connection');
mongoose
    .connect(DB)
    .then(() => {
        console.log('DB connection established');
    })
    .catch((err) => {
        console.log('DB CONNECTION FAILED');
        console.log('ERR: ', err);
    });