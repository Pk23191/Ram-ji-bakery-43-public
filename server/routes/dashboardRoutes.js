const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", auth, adminMiddleware, getDashboardStats);

module.exports = router;
