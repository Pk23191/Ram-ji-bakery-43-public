const mongoose = require("mongoose");
const dns = require("dns");

// Increase reliability of SRV resolution on some networks
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  console.warn("DNS setServers failed, using system defaults");
}

function isValidMongoUri(value) {
  return /^mongodb(\+srv)?:\/\//i.test(value);
}

function sanitizeMongoUri(value = "") {
  return value.replace(/\/\/(.*)@/g, "//****@");
}

let isInitialConnection = true;

// Disable Mongoose buffering so that we get immediate errors instead of hanging
mongoose.set("bufferCommands", false);

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://mk3559875_db_user:Piyush23191@cluster0.wivxpyh.mongodb.net/ramjibakery?retryWrites=true&w=majority";

  if (!uri) {
    console.error("❌ FATAL: MONGO_URI is missing. Please check your .env file.");
    process.exit(1);
  }

  if (!isValidMongoUri(uri)) {
    console.error("❌ FATAL: MONGO_URI format is invalid.");
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000, // Give it 10 seconds to find the server
    socketTimeoutMS: 45000
  };

  try {
    if (isInitialConnection) {
      console.log(`📡 CONNECTION ATTEMPT: ${sanitizeMongoUri(uri)}`);
    }
    
    // Explicitly check for SRV issues
    if (uri.startsWith("mongodb+srv://")) {
      const host = uri.split("@")[1]?.split("/")[0]?.split("?")[0];
      if (host) {
        dns.resolveSrv(`_mongodb._tcp.${host}`, (dnsErr, addresses) => {
          if (dnsErr) {
            console.error("🔍 DNS DIAGNOSTIC: Failed to resolve SRV record for your Atlas cluster.");
            console.error("   This often means your DNS provider (ISP) is blocking SRV records.");
            console.error("   ACTION: Try using the 'Standard' connection string from Atlas (starts with mongodb:// instead of mongodb+srv://)");
          } else {
            console.log("🔍 DNS DIAGNOSTIC: SRV records resolved correctly.");
          }
        });
      }
    }

    await mongoose.connect(uri, options);
    console.log("MongoDB Connected");
    isInitialConnection = false;
    return true;
  } catch (err) {
    console.error("MongoDB Error:", err);
    
    // Actionable advice for the user
    if (err.message.includes("SSL") || err.message.includes("handshake") || err.message.includes("80")) {
      console.error("🚨 CRITICAL: Your connection was rejected by MongoDB Atlas.");
      console.error("👉 CAUSE: Your IP Address is likely NOT WHITELISTED.");
      console.error("👉 FIX: Go to Atlas -> Network Access -> Add IP -> Choose 'Allow Access from Anywhere' (0.0.0.0/0).");
    } else if (err.message.includes("authentication failed")) {
      console.error("🚨 CRITICAL: Invalid Username or Password in MONGO_URI.");
      console.error("👉 FIX: Verify your database user credentials in Atlas dashboard.");
    } else if (err.message.includes("timeout")) {
      console.error("🚨 CRITICAL: Connection timed out.");
      console.error("👉 CAUSE: Potential firewall blocking port 27017 or slow network.");
    }

    // Attempt retry
    console.log("🔄 Retrying in 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    return connectDB();
  }
}

// State Monitoring
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  DB Link Lost. Reconnecting...");
});

module.exports = connectDB;
