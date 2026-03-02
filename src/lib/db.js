import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.NEXT_PUBLIC_DATABASE_URI;

if (!uri) {
  throw new Error("Please add NEXT_PUBLIC_DATABASE_URI to .env.local");
}

let isConnected = false;
let mongoClient;
let mongoClientPromise;

// ─── Mongoose Connection ───────────────────────────────────────────────────
export default async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// ─── MongoDB Client for Raw Collections ────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    mongoClient = new MongoClient(uri);
    global._mongoClientPromise = mongoClient.connect();
  }
  mongoClientPromise = global._mongoClientPromise;
} else {
  mongoClient = new MongoClient(uri);
  mongoClientPromise = mongoClient.connect();
}

export async function getDb() {
  const client = await mongoClientPromise;
  return client.db();
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
