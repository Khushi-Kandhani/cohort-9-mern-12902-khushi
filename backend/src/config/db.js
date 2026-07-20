const mongoose = require("mongoose");
const logger = require("../middleware/logger");

const connectDB = async () => {
  const uri = process.env.NODE_ENV === "test"
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;
