const express = require("express");
const auth = require("../middleware/auth");
const {
  signup,
  login,
  customerLogin,
  getProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/fileAuthController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/customer-login", customerLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, getProfile);

module.exports = router;
