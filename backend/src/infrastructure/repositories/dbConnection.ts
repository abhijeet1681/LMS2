import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn("⚠️  MongoDB URI not found. Running without database connection.");
      console.log("📋 To enable database features, add MONGO_URI to your .env file");
      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ Database connection error:", error.message);
    console.log("🔧 The server will continue running without database features");
    console.log("💡 To fix this:");
    console.log("   1. Install MongoDB locally, or");
    console.log("   2. Use MongoDB Atlas (cloud), or");
    console.log("   3. Update MONGO_URI in your .env file");
    // Don't exit the process, let the server run without DB
  }
};
