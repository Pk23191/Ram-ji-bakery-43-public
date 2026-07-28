const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const {
  listUsers,
  deleteUser,
  updateUserRole,
  verifyEmail,
  resendVerificationEmail
} = require("../controllers/fileUserController");

const router = express.Router();

router.get("/", auth, adminMiddleware, listUsers);
router.post("/verify-email", verifyEmail);
router.post("/verify-email/resend", auth, resendVerificationEmail);
router.delete("/:id", auth, adminMiddleware, deleteUser);
router.patch("/:id/role", auth, superAdminMiddleware, updateUserRole);

module.exports = router;
