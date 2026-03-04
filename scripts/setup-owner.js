// scripts/setup-owner.js
/**
 * Setup Owner Account Script
 * Run this once to create an owner account in your database
 *
 * Usage: node scripts/setup-owner.js
 */

require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI =
  process.env.NEXT_PUBLIC_DATABASE_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017";

async function setupOwner() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(); // Use default database from connection URI
    const usersCollection = db.collection("users");

    // Owner credentials
    const ownerEmail = "admin@restaurant.com";
    const ownerPassword = "Admin@12345";
    const ownerName = "Admin Owner";

    // Check if owner already exists
    const existingOwner = await usersCollection.findOne({ email: ownerEmail });
    if (existingOwner) {
      console.log(`⚠️  Owner already exists: ${ownerEmail}`);
      console.log("Updating role to 'owner'...");

      await usersCollection.updateOne(
        { email: ownerEmail },
        { $set: { role: "owner" } },
      );
      console.log("✅ Owner role updated!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create owner account
    const result = await usersCollection.insertOne({
      email: ownerEmail,
      password: hashedPassword,
      name: ownerName,
      role: "owner",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ Owner account created successfully!\n");
    console.log("═══════════════════════════════════════════");
    console.log("📝 LOGIN CREDENTIALS:");
    console.log("═══════════════════════════════════════════");
    console.log(`Email:    ${ownerEmail}`);
    console.log(`Password: ${ownerPassword}`);
    console.log("═══════════════════════════════════════════\n");
    console.log(`Account ID: ${result.insertedId}`);
    console.log(`Role: owner`);
    console.log("\n💡 You can now login at /login\n");
  } catch (error) {
    console.error("❌ Error setting up owner:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("✅ Database connection closed");
  }
}

// Run if called directly
if (require.main === module) {
  setupOwner();
}

module.exports = { setupOwner };
