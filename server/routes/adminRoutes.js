const express = require("express");
const auth = require("../middleware/auth");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const { getAdmins, createAdmin, deleteAdmin } = require("../controllers/adminController");

const router = express.Router();

router.get("/", auth, superAdminMiddleware, getAdmins);
router.post("/create", auth, superAdminMiddleware, createAdmin);
router.delete("/:id", auth, superAdminMiddleware, deleteAdmin);

module.exports = router;
