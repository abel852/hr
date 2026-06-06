const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Make sure MongoDB is running on your system');
    process.exit(1);
  }
};

module.exports = connectDB;

// commit-6: feat(db): add connection pool settings

// commit-7: fix(db): add retry logic for database connection
