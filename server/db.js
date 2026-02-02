import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            bufferCommands: false, // Disable mongoose buffering
            serverSelectionTimeoutMS: 5000, // Fail fast if no connection
        });
        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error; // Throw error instead of exit for serverless
    }
};

export default connectDB;
