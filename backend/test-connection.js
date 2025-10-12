require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

        const options = {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true,
            bufferCommands: false,
            ssl: true,
            tlsAllowInvalidCertificates: false,
        };

        console.log('Connection options:', JSON.stringify(options, null, 2));

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('✅ Connection successful');

        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.length);

        await mongoose.connection.close();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();