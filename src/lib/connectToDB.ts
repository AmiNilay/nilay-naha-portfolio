import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToDB = async () => {
  // If already connected with a live connection, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If the connection exists but dropped, clear it
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  // If a connection attempt is already in flight, wait for it
  if (cached.promise) {
    try {
      const connection = await cached.promise;
      if (connection.connection.readyState === 1) {
        cached.conn = connection;
        return connection;
      }
    } catch (error) {
      console.error("MongoDB pending connection failed:", error);
    }

    cached.conn = null;
    cached.promise = null;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Create a new connection promise and store it globally
  const opts = {
    bufferCommands: false,
    dbName: "portfolio",
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    waitQueueTimeoutMS: 8000,
    maxPoolSize: 5,
    minPoolSize: 0,
    // Close idle connections after 10 seconds to free Atlas slots
    maxIdleTimeMS: 10000,
  };

  console.log("Connecting to MongoDB...");
  cached.promise = mongoose
    .connect(MONGODB_URI, opts)
    .then((connection) => {
      console.log("MongoDB connected");
      return connection;
    });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }

  return cached.conn;
};