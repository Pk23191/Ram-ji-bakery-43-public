const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("express-async-errors");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const connectDB = require("../config/db");
const contactRoutes = require("./contactRoutes");
const productRoutes = require("./productRoutes");
const authRoutes = require("./authRoutes");
const orderRoutes = require("./orderRoutes");
const adminRoutes = require("./adminRoutes");
const reviewRoutes = require("./reviewRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const userRoutes = require("./userRoutes");
const couponRoutes = require("./settingsRoutes");
const { getCloudinaryConfigError } = require("../config/cloudinary");
const uploadRoutes = require("./upload");
const uploadLegacyRoutes = require("./uploadRoutes");
const bannerRoutes = require("./bannerRoutes");
const imageRoutes = require("./imageRoutes");

const app = express();
let server;

app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(
  mongoSanitize({
    replaceWith: "_"
  })
);

// Basic API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Tighter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

// Core middleware for API requests and media uploads.
const allowedOrigins = [
  "https://ram-ji-bakery-43-public-1.vercel.app",
  process.env.FRONTEND_URL,
  process.env.PUBLIC_STORE_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return cb(null, true);

      // Allow any localhost for development
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);

      // Explicit allow-list (use FRONTEND_URL / PUBLIC_STORE_URL env vars)
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // Allow Vercel preview domains
      if (/\.vercel\.app$/.test(origin)) return cb(null, true);

      // Otherwise reject CORS (safer in production)
      return cb(new Error("CORS not allowed for origin: " + origin), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    optionsSuccessStatus: 200
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
// Enable gzip/deflate compression for API responses to reduce payload size
app.use(compression());
// Serve uploaded static files from the project root `uploads/` directory.
// Using process.cwd() makes the path consistent when running from different working dirs.
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// API route registration.
app.use("/api/contact", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploads", uploadLegacyRoutes);
app.use("/api/banner", bannerRoutes);
app.use("/api/images", imageRoutes);

app.get("/api/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({ ok: true, service: "Ramji Bakery API", dbConnected: readyState === 1, readyState });
});

app.get("/api/test-db-full", async (req, res) => {
  try {
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      return res.json({ connected: false, readyState });
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const stats = {};

    for (const coll of collections) {
      stats[coll.name] = {
        count: await db.collection(coll.name).countDocuments(),
        sample: await db.collection(coll.name).findOne()
      };
    }

    res.json({
      connected: true,
      readyState: 1
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/api/test-db", (req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({ ok: readyState === 1, dbConnected: readyState === 1, readyState });
});

app.use(["/api/settings"], (req, res) => {
  res.status(501).json({ message: "MongoDB has been removed from this project. These endpoints are disabled." });
});

// 404 handler for non-matching routes
app.use((req, res) => {
  // Enhanced logging to identify mismatched routes
  console.log(`404 NOT FOUND: ${req.method} ${req.path}`);
  
  // If this looks like an API or uploads request, return JSON 404.
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return res.status(404).json({ ok: false, message: "Route not found" });
  }

  // For browser navigation requests, redirect to the frontend store URL so Next.js can handle client routing.
  const frontendUrl = process.env.PUBLIC_STORE_URL || process.env.FRONTEND_URL || "https://ram-ji-bakery-43-public-1.vercel.app";

  if (req.accepts("html")) {
    const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    if (isLocal) {
      // Don't redirect on localhost so we can see the backend status page/routes if needed.
    } else {
      const target = frontendUrl.replace(/\/$/, "") + req.originalUrl;
      return res.redirect(target);
    }
  }

  // Fallback to JSON for non-HTML clients.
  res.status(404).json({ ok: false, message: "Route not found" });
});

// Unified error handler for cleaner production responses.
app.use((error, req, res, next) => {
  const status = error?.statusCode || error?.status || 500;
  const message = error?.message || "Server error";
  console.error("ERROR_HANDLER:", { status, message, stack: error?.stack });
  res.status(status).json({ ok: false, message });
});

const PORT = process.env.PORT || 10000;

async function ensureDefaultAdmin() {
  try {
    const Admin = require("../models/Admin");
    const admins = await Admin.find({});
    if (admins.length) return;

    const email = process.env.ADMIN_EMAIL || "admin@ramjibakery.in";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const role = ["admin", "superadmin"].includes(process.env.ADMIN_ROLE) ? process.env.ADMIN_ROLE : "superadmin";
    const passwordHash = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: passwordHash,
      role
    });
    console.log(`Admin seeded in Mongo: ${email} (${role})`);
  } catch (error) {
    console.error("Admin mongo seed failed:", error);
  }
}

function closeServerAndExit(exitCode = 0) {
  if (!server) {
    process.exit(exitCode);
    return;
  }

  server.close(() => {
    process.exit(exitCode);
  });

  setTimeout(() => process.exit(exitCode), 3000).unref();
}

function registerShutdownHandlers() {
  process.on("SIGINT", () => closeServerAndExit(0));
  process.on("SIGTERM", () => closeServerAndExit(0));
  process.once("SIGUSR2", () => {
    if (!server) {
      process.kill(process.pid, "SIGUSR2");
      return;
    }

    server.close(() => {
      process.kill(process.pid, "SIGUSR2");
    });

    setTimeout(() => process.kill(process.pid, "SIGUSR2"), 3000).unref();
  });
}

async function startServer() {
  // Fail fast if JWT_SECRET is missing in production
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ FATAL: JWT_SECRET is not set. Authentication will fail for all users.");
      console.error("   Set JWT_SECRET in your Render environment variables.");
    } else {
      console.warn("⚠️  JWT_SECRET is not set — using dev fallback. Never do this in production!");
    }
  }

  // Attempt to connect to MongoDB in the background.
  // The connectDB function now handles its own infinite retry loop.
  connectDB()
    .then(async () => {
      // Background initialization after successful connection
      if (mongoose.connection.readyState === 1) {
        await ensureDefaultAdmin();
      }
    })
    .catch((error) => {
      // This catch is mostly a safety net as connectDB internally retries
      console.error("🔥 Global MongoDB Connection Blocker:", error.message);
    });

  const cloudinaryError = getCloudinaryConfigError();
  if (cloudinaryError) {
    console.warn("⚠️  Cloudinary Warning:", cloudinaryError);
  }

  // --- Strict Env Validations ---
  const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  ];

  let hasMissingEnv = false;
  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ CRITICAL MISSING ENV: ${key}`);
      hasMissingEnv = true;
    }
  });

  if (hasMissingEnv && process.env.NODE_ENV === "production") {
    console.error("⚠️  WARNING: Missing required environment variables in production.");
    console.error("⚠️  The server will continue to run for testing, but functionality will be degraded.");
  }

  console.log("🚀 Server running");
  console.log("🌍 Mode:", process.env.NODE_ENV || "development");

  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
      closeServerAndExit(1);
      return;
    }

    console.error(error);
    closeServerAndExit(1);
  });
}

// Prevent silent crashes in production
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  closeServerAndExit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

registerShutdownHandlers();
startServer();
