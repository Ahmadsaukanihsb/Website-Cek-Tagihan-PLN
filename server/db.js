import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('📦 Using existing MongoDB connection');
        return;
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
