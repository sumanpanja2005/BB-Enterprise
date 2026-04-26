const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const maxRetries = 5;
  const retryDelayMs = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      console.error(
        `MongoDB connection error (attempt ${attempt}/${maxRetries}):`,
        err.message
      );

      if (isLastAttempt) {
        throw new Error(`MongoDB unavailable after retries: ${err.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

module.exports = connectDB;
