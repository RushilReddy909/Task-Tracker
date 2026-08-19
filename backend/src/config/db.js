import dns from 'node:dns';
import mongoose from 'mongoose';

// Some ISP/router DNS servers don't properly support the SRV record
// lookups that `mongodb+srv://` URIs require, causing Node to fail with
// `querySrv ECONNREFUSED` even though the connection string is correct
// (tools like Compass often use a different resolution path, so they
// still work). Pointing Node's resolver at Cloudflare's public DNS
// fixes this without touching OS-level network settings.
dns.setServers(['1.1.1.1', '1.0.0.1']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set in the environment');
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
