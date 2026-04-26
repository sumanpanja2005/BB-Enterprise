const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    return;
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
        console.error('Continuing without DB connection; waiting for next restart.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

module.exports = connectDB;
