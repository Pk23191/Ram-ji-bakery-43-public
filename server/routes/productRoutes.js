const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../utils/upload");
const { handleUploadError } = require("../controllers/uploadController");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();
const uploadProductImages = upload.array("images", 4);

function runProductUpload(req, res, next) {
  uploadProductImages(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return next();
  });
}

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/add", auth, adminMiddleware, runProductUpload, createProduct);
router.post("/", auth, adminMiddleware, runProductUpload, createProduct);
router.put("/:id", auth, adminMiddleware, runProductUpload, updateProduct);
router.delete("/:id", auth, adminMiddleware, deleteProduct);

module.exports = router;
