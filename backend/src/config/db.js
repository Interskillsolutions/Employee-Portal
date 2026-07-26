import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if unsupported
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("[Database Error]: MongoDB connection string (MONGODB_URI / MONGO_URI) is missing in environment variables!");
    return;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[Database]: MongoDB Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning]: MongoDB connection error (${error.message}). Switched to Resilient Fallback.`);
  }
};

export default connectDB;
