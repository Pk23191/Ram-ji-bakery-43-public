const mongoose = require("mongoose");
const path = require("path");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function inspectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGO_URI found in .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("\nCollections:");
    collections.forEach(c => console.log(` - ${c.name}`));

    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`\nCollection: ${coll.name} (${count} documents)`);
      const sample = await db.collection(coll.name).findOne();
      if (sample) {
        console.log("Sample document:");
        console.log(JSON.stringify(sample, null, 2));
      } else {
        console.log("Collection is empty.");
      }
    }

    await mongoose.disconnect();
    console.log("\nDisconnected.");
  } catch (error) {
    console.error("Error inspecting DB:", error);
    process.exit(1);
  }
}

inspectDB();
