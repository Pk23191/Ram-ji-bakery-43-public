const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("express-async-errors");
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const uploadRoutes = require("./routes/upload");
const uploadLegacyRoutes = require("./routes/uploadRoutes");

const app = express();
let server;

// Core middleware for API requests and media uploads.
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API route registration.
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/uploads", uploadLegacyRoutes);
app.use("/api", orderRoutes);
app.use("/", authRoutes);
app.use("/products", productRoutes);
app.use("/", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Ramji Bakery API" });
});

// Unified error handler for cleaner production responses.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

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

connectDB().finally(() => {
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

  registerShutdownHandlers();
});
