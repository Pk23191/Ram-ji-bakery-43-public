const express = require("express");
const { memoryUpload } = require("../utils/upload");
const { uploadImages, handleUploadError } = require("../controllers/uploadController");

const router = express.Router();

router.post("/products", (req, res, next) => {
  memoryUpload.array("images", 4)(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return uploadImages(req, res, next);
  });
});

module.exports = router;
