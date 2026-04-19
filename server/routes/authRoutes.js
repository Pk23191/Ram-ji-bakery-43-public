const express = require("express");
const passport = require("passport");
const {
  customerLogin,
  sendOtp,
  verifyOtp,
  verifyEmailFromQuery,
  handleGoogleCallback
} = require("../controllers/authController");

const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword
} = require("../controllers/userController");

const router = express.Router();
const googleFailureRedirect = `${process.env.PUBLIC_STORE_URL || process.env.FRONTEND_URL || "https://ram-ji-bakery-43-public.vercel.app"}/login?google=failed`;
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

function requireGoogleAuth(req, res, next) {
  if (!googleConfigured) {
    return res.status(503).json({ message: "Google login is not configured" });
  }
  return next();
}

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", require("../controllers/authController").login);
router.post("/customer-login", customerLogin);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmailFromQuery);
router.get(
  "/google",
  requireGoogleAuth,
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  requireGoogleAuth,
  passport.authenticate("google", { session: false, failureRedirect: googleFailureRedirect }),
  handleGoogleCallback
);

module.exports = router;
