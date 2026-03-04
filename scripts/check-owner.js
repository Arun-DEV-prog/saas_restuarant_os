// scripts/check-owner.js
/**
 * Check if owner account exists and verify password
 */

require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI =
  process.env.NEXT_PUBLIC_DATABASE_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017";
const DB_NAME = "restaurant_saas";

async function checkOwner() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    // Check for owner account
    const owner = await usersCollection.findOne({
      email: "admin@restaurant.com",
    });

    if (!owner) {
      console.log("❌ No owner account found!");
      return;
    }

    console.log("\n📋 Owner Account Found:");
    console.log("─".repeat(50));
    console.log(`Email: ${owner.email}`);
    console.log(`Name: ${owner.name}`);
    console.log(`Role: ${owner.role}`);
    console.log(`ID: ${owner._id}`);
    console.log(`Password Hash: ${owner.password.substring(0, 20)}...`);

    // Verify password
    const testPassword = "Admin@12345";
    const isValid = await bcrypt.compare(testPassword, owner.password);

    console.log("\n🔐 Password Verification:");
    console.log("─".repeat(50));
    console.log(`Test Password: ${testPassword}`);
    console.log(`Match Result: ${isValid ? "✅ VALID" : "❌ INVALID"}`);

    if (!isValid) {
      console.log("\n⚠️  Password mismatch! Trying to fix...");
      const newHash = await bcrypt.hash(testPassword, 10);
      await usersCollection.updateOne(
        { email: "admin@restaurant.com" },
        { $set: { password: newHash } },
      );
      console.log("✅ Password updated!");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

checkOwner();
