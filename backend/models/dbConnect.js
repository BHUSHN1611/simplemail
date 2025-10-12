const mongoose = require('mongoose');

// Connection configuration with timeout, pooling, and retry settings
const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variables
        const DB = "mongodb+srv://bhushn:railmadat16@cluster0.aeoisat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" || process.env.MONGODB_URI;

        if (!DB) {
            throw new Error('MongoDB URI not found in environment variables');
        }

        // Connection options for better reliability and performance
        const options = {
            // Connection timeout settings
            serverSelectionTimeoutMS: 30000, // 30 seconds
            connectTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds

            // Pooling configuration
            maxPoolSize: 10, // Maximum number of connections in the connection pool
            minPoolSize: 2, // Minimum number of connections in the connection pool
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity

            // Retry configuration
            retryWrites: true,
            retryReads: true,

            // Buffer settings
            bufferCommands: false, // Disable mongoose buffering

            // Additional settings for Atlas
            ssl: true,
            tlsAllowInvalidCertificates: false,
        };

        console.log('Attempting to connect to MongoDB...');

        // Connect to MongoDB
        await mongoose.connect(DB, options);

        console.log('✅ MongoDB connection established successfully');

        // Connection event listeners for health monitoring
        mongoose.connection.on('connected', () => {
            console.log('📊 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        mongoose.connection.on('reconnectFailed', (err) => {
            console.error('❌ MongoDB reconnection failed:', err);
        });

        // Graceful shutdown handling
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('🔐 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return mongoose.connection;

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);

        // Retry connection after 5 seconds
        console.log('🔄 Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);

        throw error;
    }
};

// Health check function
const checkConnectionHealth = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    const state = states[mongoose.connection.readyState] || 'unknown';
    const isHealthy = mongoose.connection.readyState === 1;

    return {
        status: state,
        healthy: isHealthy,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        readyState: mongoose.connection.readyState
    };
};

// Export both the connection function and health check
module.exports = {
    connectDB,
    checkConnectionHealth
};

// Auto-connect if this file is run directly
if (require.main === module) {
    connectDB().catch(console.error);
}