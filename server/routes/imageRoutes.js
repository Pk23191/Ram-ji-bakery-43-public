const express = require("express");
const { memoryUpload } = require("../utils/upload");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const { uploadImages, listImages, deleteImage } = require("../controllers/imageController");

const router = express.Router();

router.get("/", auth, adminMiddleware, listImages);
router.post("/", auth, adminMiddleware, memoryUpload.array("images", 4), uploadImages);
router.delete("/:id", auth, adminMiddleware, deleteImage);

module.exports = router;
