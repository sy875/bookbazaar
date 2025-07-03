import mongoose from "mongoose";

const connectDB = async () => {
  console.log(process.env.MONGODB_URI)
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if connection fails
  }
};

export default connectDB;
