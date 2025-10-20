// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB);
    console.log(`Database connected to host ${conn.connection.host}`);
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1); // exit process on DB failure
  }
};

module.exports = connectDB;
