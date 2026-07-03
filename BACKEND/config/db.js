import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing required environment variable: MONGO_URI');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    const isSrvDnsError =
      error?.message?.includes('querySrv') ||
      error?.message?.includes('_mongodb._tcp') ||
      error?.code === 'ECONNREFUSED';

    if (isSrvDnsError && String(process.env.MONGO_URI).startsWith('mongodb+srv://')) {
      throw new Error(
        'MongoDB Atlas SRV lookup failed. This usually means your machine cannot resolve DNS for mongodb.net or the Atlas cluster is unreachable. Use the standard mongodb:// connection string from Atlas, or fix DNS/network access and try again.'
      );
    }

    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};
