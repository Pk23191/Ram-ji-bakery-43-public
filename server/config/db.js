const mongoose = require("mongoose");
const { setDbConnected } = require("../data/memoryStore");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ramji-bakery");
    console.log("MongoDB connected");
    setDbConnected(true);
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed, using in-memory fallback:", error.message);
    setDbConnected(false);
    return false;
  }
}

module.exports = connectDB;
