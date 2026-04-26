const mongoose = require("mongoose");
const Product = require("../models/Product");
const { uploadImageBuffer, getCloudinaryConfigError } = require("../config/cloudinary");

function normalizeCategory(category = "") {
  const value = String(category).trim().toLowerCase();

  if (["cake", "cakes"].includes(value)) return "cake";
  if (["pastry", "pastries", "bread", "breads"].includes(value)) return "pastry";
  if (["party", "birthday items", "birthday item", "birthday", "decor"].includes(value)) return "party";
  if (["balloon", "balloons"].includes(value)) return "balloons";
  if (["ribbon", "ribbons"].includes(value)) return "ribbons";
  if (["candle", "candles"].includes(value)) return "candles";
  if (["hat", "hats"].includes(value)) return "hats";
  if (["banner", "banners"].includes(value)) return "banners";

  return value;
}

function getCategoryAliases(category) {
  switch (category) {
    case "cake":
      return ["cake", "cakes"];
    case "pastry":
      return ["pastry", "pastries", "bread", "breads"];
    case "party":
      return ["party", "birthday items", "birthday item", "birthday", "decor"];
    case "balloons":
      return ["balloons", "balloon"];
    case "ribbons":
      return ["ribbons", "ribbon"];
    case "candles":
      return ["candles", "candle"];
    case "hats":
      return ["hats", "hat"];
    case "banners":
      return ["banners", "banner"];
    default:
      return [];
  }
}

function parseList(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
}

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

function makeAbsoluteUrl(value = "") {
  const source = String(value || "").trim();
  if (!source) return source;
  if (/^https?:\/\//i.test(source) || source.startsWith("data:image/")) return source;

  const backendBase = (process.env.BACKEND_URL || process.env.PUBLIC_API_URL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  if (source.startsWith("/uploads") || source.startsWith("uploads")) {
    return backendBase ? `${backendBase}${source.startsWith("/") ? source : `/${source}`}` : source;
  }

  return source;
}

async function uploadFilesToCloudinary(files = []) {
  if (!Array.isArray(files) || !files.length) {
    return [];
  }

  const configError = getCloudinaryConfigError();
  if (configError) {
    const error = new Error(configError);
    error.statusCode = 500;
    throw error;
  }

  const uploaded = await Promise.all(
    files.map((file, index) =>
      uploadImageBuffer(file.buffer, {
        public_id: `product-${Date.now()}-${index + 1}`,
        folder: "ramji-bakery/products",
        transformation: [{ width: 400, crop: "scale", quality: "auto" }]
      })
    )
  );

  return uploaded.map((item) => item?.secure_url).filter(Boolean);
}

function buildProductPayload(body = {}, options = {}) {
  const { uploadedImages = [], existingImages = [] } = options;
  const bodyImageUrls = parseMultiValue(body.imageUrls)
    .map((entry) => makeAbsoluteUrl(entry))
    .filter(Boolean);
  const keepImages = existingImages.map((entry) => makeAbsoluteUrl(entry)).filter(Boolean);
  const images = [...keepImages, ...uploadedImages, ...bodyImageUrls].slice(0, 4);
  const colors = parseList(body.colors)
    .map((entry) => ({
      name: String(entry?.name || "").trim(),
      image: makeAbsoluteUrl(entry?.image || "")
    }))
    .filter((entry) => entry.name && entry.image);

  return {
    name: String(body.name || "").trim(),
    category: normalizeCategory(body.category),
    description: String(body.description || "").trim(),
    price: Number(body.price),
    discountPercent: Math.min(Math.max(Number(body.discountPercent || 0), 0), 90),
    image: images[0] || makeAbsoluteUrl(body.image || ""),
    images,
    colors,
    badge: String(body.badge || "Admin Added").trim(),
    rating: Number(body.rating || 4.7),
    flavors: parseMultiValue(body.flavors).map((entry) => String(entry || "").trim()).filter(Boolean)
  };
}

function ensureDatabaseReady() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("Database not connected");
    error.statusCode = 503;
    throw error;
  }
}

async function getProducts(req, res) {
  try {
    ensureDatabaseReady();

    const category = normalizeCategory(req.query.category);
    const limit = Math.max(0, Number.parseInt(String(req.query.limit || "0"), 10) || 0);
    const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
    const filter = {};

    if (category) {
      filter.category = { $in: getCategoryAliases(category).length ? getCategoryAliases(category) : [category] };
    }

    console.log("GET /api/products", { filter, page, limit });

    const query = Product.find(filter).sort({ createdAt: -1 }).lean();
    if (limit > 0) {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [items, total] = await Promise.all([query, Product.countDocuments(filter)]);
    const products = items.map((product) => ({
      ...product,
      image: makeAbsoluteUrl(product.image),
      images: Array.isArray(product.images) ? product.images.map((entry) => makeAbsoluteUrl(entry)) : []
    }));

    if (limit > 0) {
      return res.json({ success: true, items: products, total, page, limit });
    }

    return res.json(products);
  } catch (error) {
    console.error("Get products failed:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to load products"
    });
  }
}

async function getProductById(req, res) {
  try {
    ensureDatabaseReady();

    console.log("GET /api/products/:id", { id: req.params.id });
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({
      ...product,
      image: makeAbsoluteUrl(product.image),
      images: Array.isArray(product.images) ? product.images.map((entry) => makeAbsoluteUrl(entry)) : []
    });
  } catch (error) {
    console.error("Get product failed:", error);
    const status = error.name === "CastError" ? 404 : error.statusCode || 500;
    const message = error.name === "CastError" ? "Product not found" : error.message || "Unable to load product";
    return res.status(status).json({ success: false, message });
  }
}

async function createProduct(req, res) {
  try {
    ensureDatabaseReady();

    console.log("POST /api/products payload:", {
      body: req.body,
      files: Array.isArray(req.files) ? req.files.length : req.file ? 1 : 0
    });

    const files = req.files || (req.file ? [req.file] : []);
    const uploadedImages = await uploadFilesToCloudinary(files);
    const payload = buildProductPayload(req.body, { uploadedImages });

    if (!payload.name || !payload.category || !Number.isFinite(payload.price) || payload.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "name, category and a valid positive price are required"
      });
    }

    if (!payload.image) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required"
      });
    }

    const product = new Product(payload);
    await product.save();

    console.log("Product saved successfully:", { id: product._id.toString(), name: product.name });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product failed:", error);
    const status = error.name === "ValidationError" ? 400 : error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Unable to save product"
    });
  }
}

async function updateProduct(req, res) {
  try {
    ensureDatabaseReady();

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const files = req.files || (req.file ? [req.file] : []);
    const uploadedImages = await uploadFilesToCloudinary(files);
    const payload = buildProductPayload(
      { ...existingProduct.toObject(), ...req.body },
      {
        uploadedImages,
        existingImages: parseMultiValue(req.body.existingImages).length
          ? parseMultiValue(req.body.existingImages)
          : existingProduct.images || []
      }
    );

    Object.assign(existingProduct, payload);
    await existingProduct.save();

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: existingProduct
    });
  } catch (error) {
    console.error("Update product failed:", error);
    const status = error.name === "ValidationError" ? 400 : error.name === "CastError" ? 404 : error.statusCode || 500;
    const message = error.name === "CastError" ? "Product not found" : error.message || "Unable to update product";
    return res.status(status).json({ success: false, message });
  }
}

async function deleteProduct(req, res) {
  try {
    ensureDatabaseReady();

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product failed:", error);
    const status = error.name === "CastError" ? 404 : error.statusCode || 500;
    const message = error.name === "CastError" ? "Product not found" : error.message || "Unable to delete product";
    return res.status(status).json({ success: false, message });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
