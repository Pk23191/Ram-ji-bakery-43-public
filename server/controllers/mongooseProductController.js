const mongoose = require("mongoose");
const path = require("path");
const Product = require("../models/Product");
const { uploadImageBuffer, getCloudinaryConfigError } = require("../config/cloudinary");
function parseMultiValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [trimmed];
    } catch (error) {
      return [trimmed];
    }
  }
  return [];
}

function parseColors(value) {
  return parseMultiValue(value)
    .map((color) => ({
      name: String(color?.name || "").trim(),
      image: String(color?.image || "").trim()
    }))
    .filter((color) => color.name && color.image);
}

function buildProductData(body, images) {
  const { colors, imageUrls, existingImages, ...productFields } = body;

  return {
    ...productFields,
    colors: parseColors(colors),
    image: images[0],
    images
  };
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function uploadFilesToCloudinary(files = []) {
  try {
    const configError = getCloudinaryConfigError();
    if (configError) throw new Error(configError);
    if (!Array.isArray(files) || !files.length) return [];

    const uploaded = await Promise.all(
      files.map((file, index) =>
        uploadImageBuffer(file.buffer, {
          public_id: `product-${Date.now()}-${index + 1}`,
          folder: "ramji-bakery/products",
          transformation: [{ width: 500, height: 500, crop: "limit", quality: "auto" }]
        })
      )
    );

    return uploaded.map((a) => a && a.secure_url).filter(Boolean);
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}

async function getProducts(req, res) {
  try {
    const { category, limit = 0, page = 1 } = req.query;
    
    const isConnected = isDbConnected();
    if (!isConnected) {
      console.warn("DB not connected, requests will fail or wait for connection");
    }

    const filter = {};
    if (category && category.toLowerCase() !== "all") {
      filter.category = category.toLowerCase();
    }

    const query = Product.find(filter).sort({ createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * Number(limit);
      const [items, total] = await Promise.all([
        query.skip(skip).limit(Number(limit)),
        Product.countDocuments(filter)
      ]);
      return res.json({ items, total, page: Number(page), limit: Number(limit) });
    }

    const items = await query;
    return res.json(items);
  } catch (error) {
    console.error("Get products failed:", error);
    res.status(500).json({ message: "Unable to load products from database" });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Get product failed:", error);
    res.status(500).json({ message: "Unable to load product detail" });
  }
}

async function createProduct(req, res) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    let uploadedImages = [];

    if (files.length) {
      uploadedImages = await uploadFilesToCloudinary(files);
    }

    const imageUrls = parseMultiValue(req.body.imageUrls);
    const images = [...uploadedImages, ...imageUrls].filter(Boolean).slice(0, 5);

    if (!images.length) {
      return res.status(400).json({ message: "Please provide at least one image" });
    }

    const product = await Product.create(buildProductData(req.body, images));

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product failed:", error);
    res.status(500).json({ message: error.message || "Unable to save product" });
  }
}

async function updateProduct(req, res) {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const files = req.files || (req.file ? [req.file] : []);
    let uploadedImages = [];
    if (files.length) {
      uploadedImages = await uploadFilesToCloudinary(files);
    }

    let existingImages = parseMultiValue(req.body.existingImages);
    if (!existingImages.length && req.body.existingImages === undefined) {
      existingImages = product.images;
    }
    const imageUrls = parseMultiValue(req.body.imageUrls);
    const images = [...existingImages, ...uploadedImages, ...imageUrls].filter(Boolean).slice(0, 5);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      buildProductData(req.body, images),
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product failed:", error);
    res.status(500).json({ message: error.message || "Unable to update product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product failed:", error);
    res.status(500).json({ message: "Unable to delete product" });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
