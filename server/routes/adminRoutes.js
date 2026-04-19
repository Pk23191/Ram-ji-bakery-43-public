const express = require("express");
const auth = require("../middleware/auth");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const { getAdmins, createAdmin, deleteAdmin } = require("../controllers/adminController");

const router = express.Router();

const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/super-login", authController.superLogin);
router.get("/", auth, superAdminMiddleware, getAdmins);
router.post("/create", auth, superAdminMiddleware, createAdmin);
router.delete("/:id", auth, superAdminMiddleware, deleteAdmin);

module.exports = router;
