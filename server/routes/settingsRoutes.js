const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getSettings, upsertSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/", getSettings);
router.post("/", auth, adminMiddleware, upsertSettings);

module.exports = router;
