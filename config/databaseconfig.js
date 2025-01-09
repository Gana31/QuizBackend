import mongoose from 'mongoose';
import ServerConfig from './ServerConfig.js';

const connectDatabase = async () => {
  try {
    await mongoose.connect(`${ServerConfig.DB_URI}/quiz`);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export { connectDatabase };
