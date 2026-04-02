const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// upload route
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// start server
app.listen(5000, () => {
  console.log("🔥 Server running on port 5000");
});