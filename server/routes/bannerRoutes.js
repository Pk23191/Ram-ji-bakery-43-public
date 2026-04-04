const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const { memoryUpload } = require("../utils/upload");
const { handleUploadError } = require("../controllers/uploadController");
const {
  getActiveBanner,
  getAllBanners,
  uploadBanner,
  deleteBanner,
  activateBanner
} = require("../controllers/bannerController");

const router = express.Router();

// Public: get the currently active banner
router.get("/", getActiveBanner);

// Admin: list all banners
router.get("/all", auth, adminMiddleware, getAllBanners);

// Admin: upload a new banner image
router.post("/upload", auth, adminMiddleware, (req, res, next) => {
  memoryUpload.single("image")(req, res, (error) => {
    if (error) return handleUploadError(error, req, res, next);
    return uploadBanner(req, res, next);
  });
});

// Admin: delete a banner
router.delete("/:id", auth, adminMiddleware, deleteBanner);

// Admin: activate a specific banner
router.patch("/:id/activate", auth, adminMiddleware, activateBanner);

module.exports = router;
