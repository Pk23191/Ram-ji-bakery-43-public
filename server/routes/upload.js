const express = require("express");
const { memoryUpload } = require("../utils/upload");
const {
  uploadSingleImage,
  uploadImages,
  handleUploadError
} = require("../controllers/uploadController");

const router = express.Router();

const uploadFields = memoryUpload.fields([
  { name: "image", maxCount: 4 },
  { name: "images", maxCount: 4 }
]);

router.post("/", (req, res, next) => {
  uploadFields(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return uploadSingleImage(req, res, next);
  });
});

router.post("/multiple", (req, res, next) => {
  uploadFields(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return uploadImages(req, res, next);
  });
});

module.exports = router;
