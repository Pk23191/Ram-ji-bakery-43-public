const path = require("path");
const { uploadImageBuffer, getCloudinaryConfigError } = require("../config/cloudinary");
const { readJson, writeJson } = require("../utils/fileStore");

const PRODUCTS_FILE = path.join(__dirname, "..", "data", "products.json");
const SAMPLE_PRODUCTS_FILE = path.join(__dirname, "..", "data", "products.sample.json");

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

function makeProductId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeStoredProduct(product = {}) {
  const id = String(product._id || product.id || makeProductId());
  const images = Array.isArray(product.images)
    ? product.images.map((entry) => makeAbsoluteUrl(entry)).filter(Boolean)
    : [];
  const image = makeAbsoluteUrl(product.image || images[0] || "");

  return {
    ...product,
    _id: id,
    id,
    category: normalizeCategory(product.category),
    price: Number(product.price || 0),
    discountPercent: Math.min(Math.max(Number(product.discountPercent || 0), 0), 90),
    image,
    images: images.length ? images : image ? [image] : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    flavors: Array.isArray(product.flavors) ? product.flavors : [],
    rating: Number(product.rating || 4.7),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || product.createdAt || new Date().toISOString()
  };
}

async function readProducts() {
  const sampleProducts = await readJson(SAMPLE_PRODUCTS_FILE, []);
  const products = await readJson(PRODUCTS_FILE, sampleProducts);
  const normalizedProducts = products.map((product) => normalizeStoredProduct(product));

  if (!products.length && sampleProducts.length) {
    await writeProducts(normalizedProducts);
  }

  return normalizedProducts;
}

async function writeProducts(products) {
  await writeJson(PRODUCTS_FILE, products.map((product) => normalizeStoredProduct(product)));
}

async function getProducts(req, res) {
  try {
    const category = normalizeCategory(req.query.category);
    const limit = Math.max(0, Number.parseInt(String(req.query.limit || "0"), 10) || 0);
    const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
    const categoryAliases = category ? getCategoryAliases(category) : [];
    const filterCategories = categoryAliases.length ? categoryAliases : category ? [category] : [];
    const allProducts = (await readProducts()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const products = filterCategories.length
      ? allProducts.filter((product) => filterCategories.includes(normalizeCategory(product.category)))
      : allProducts;
    const total = products.length;
    const items = limit > 0 ? products.slice((page - 1) * limit, (page - 1) * limit + limit) : products;

    if (limit > 0) {
      return res.json({ success: true, items, total, page, limit });
    }

    return res.json(items);
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
    const products = await readProducts();
    const product = products.find((item) => item._id === req.params.id || item.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Get product failed:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Unable to load product" });
  }
}

async function createProduct(req, res) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const uploadedImages = await uploadFilesToCloudinary(files);
    const payload = normalizeStoredProduct(buildProductPayload(req.body, { uploadedImages }));

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

    const products = await readProducts();
    const product = {
      ...payload,
      _id: makeProductId(),
      id: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    product.id = product._id;
    products.unshift(product);
    await writeProducts(products);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product failed:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to save product"
    });
  }
}

async function updateProduct(req, res) {
  try {
    const products = await readProducts();
    const index = products.findIndex((item) => item._id === req.params.id || item.id === req.params.id);
    if (index < 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const existingProduct = products[index];
    const files = req.files || (req.file ? [req.file] : []);
    const uploadedImages = await uploadFilesToCloudinary(files);
    const payload = buildProductPayload(
      { ...existingProduct, ...req.body },
      {
        uploadedImages,
        existingImages: parseMultiValue(req.body.existingImages).length
          ? parseMultiValue(req.body.existingImages)
          : existingProduct.images || []
      }
    );

    const product = normalizeStoredProduct({
      ...existingProduct,
      ...payload,
      _id: existingProduct._id,
      id: existingProduct.id || existingProduct._id,
      createdAt: existingProduct.createdAt,
      updatedAt: new Date().toISOString()
    });
    products[index] = product;
    await writeProducts(products);

    return res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product failed:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Unable to update product" });
  }
}

async function deleteProduct(req, res) {
  try {
    const products = await readProducts();
    const nextProducts = products.filter((item) => item._id !== req.params.id && item.id !== req.params.id);
    if (nextProducts.length === products.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await writeProducts(nextProducts);
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product failed:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Unable to delete product" });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
