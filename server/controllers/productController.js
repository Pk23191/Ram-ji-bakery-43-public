const Product = require("../models/Product");
const { memoryStore } = require("../data/memoryStore");

function normalizeCategory(category = "") {
  const value = String(category).trim().toLowerCase();

  if (["cake", "cakes"].includes(value)) return "cake";
  if (["pastry", "pastries", "bread", "breads"].includes(value)) return "pastry";
  if (["party", "birthday items", "birthday item", "birthday", "decor"].includes(value)) return "party";

  return value;
}

function getCategoryAliases(category) {
  switch (category) {
    case "cake":
      return ["cake", "cakes", "Cake", "Cakes"];
    case "pastry":
      return ["pastry", "pastries", "bread", "breads", "Pastry", "Pastries", "Bread", "Breads"];
    case "party":
      return [
        "party",
        "birthday items",
        "birthday item",
        "birthday",
        "decor",
        "Party",
        "Birthday Items",
        "Birthday Item",
        "Birthday",
        "Decor"
      ];
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
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [trimmed];
    } catch (error) {
      return [trimmed];
    }
  }

  return [];
}

function buildUploadedFileUrls(req, files = []) {
  return files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);
}

function normalizeProductPayload(body = {}, options = {}) {
  const {
    uploadedImages = [],
    existingImages = []
  } = options;
  const imageUrls = parseMultiValue(body.imageUrls)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  const keptImages = existingImages
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  const normalizedImages = [...keptImages, ...uploadedImages, ...imageUrls].filter(Boolean).slice(0, 4);
  const colors = parseList(body.colors)
    .map((entry) => ({
      name: String(entry?.name || "").trim(),
      image: String(entry?.image || "").trim()
    }))
    .filter((entry) => entry.name && entry.image);

  return {
    ...body,
    category: normalizeCategory(body.category),
    image: normalizedImages[0] || "",
    images: normalizedImages,
    colors,
    description: body.description || "",
    price: Number(body.price),
    badge: body.badge || "Admin Added",
    rating: Number(body.rating || 4.7)
  };
}

async function getProducts(req, res) {
  const category = normalizeCategory(req.query.category);
  const products = memoryStore.dbConnected
    ? await Product.find(
        category ? { category: { $in: getCategoryAliases(category) } } : {}
      ).sort({ createdAt: -1 })
    : [...memoryStore.products]
        .reverse()
        .filter((product) => !category || normalizeCategory(product.category) === category);

  res.json(products);
}

async function getProductById(req, res) {
  const product = memoryStore.dbConnected
    ? await Product.findById(req.params.id)
    : memoryStore.products.find((item) => String(item._id) === req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

async function createProduct(req, res) {
  const payload = normalizeProductPayload(req.body, {
    uploadedImages: buildUploadedFileUrls(req, req.files || [])
  });

  if (!payload.images.length) {
    return res.status(400).json({ message: "Please add at least one product image." });
  }

  const product = memoryStore.dbConnected
    ? await Product.create(payload)
    : { ...payload, _id: `memory-product-${Date.now()}` };

  if (!memoryStore.dbConnected) {
    memoryStore.products.unshift(product);
  }

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const currentProduct = memoryStore.dbConnected
    ? await Product.findById(req.params.id)
    : memoryStore.products.find((item) => String(item._id) === req.params.id);

  if (!currentProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  const currentImages = parseMultiValue(req.body.existingImages);
  const payload = normalizeProductPayload(
    {
      ...(currentProduct.toObject ? currentProduct.toObject() : currentProduct),
      ...req.body
    },
    {
      uploadedImages: buildUploadedFileUrls(req, req.files || []),
      existingImages: currentImages.length ? currentImages : currentProduct.images || []
    }
  );

  if (!payload.images.length) {
    return res.status(400).json({ message: "Please keep or add at least one product image." });
  }

  const product = memoryStore.dbConnected
    ? await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    : (() => {
        const index = memoryStore.products.findIndex((item) => String(item._id) === req.params.id);
        if (index === -1) return null;
        memoryStore.products[index] = { ...memoryStore.products[index], ...payload };
        return memoryStore.products[index];
      })();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
}

async function deleteProduct(req, res) {
  const product = memoryStore.dbConnected
    ? await Product.findByIdAndDelete(req.params.id)
    : (() => {
        const index = memoryStore.products.findIndex((item) => String(item._id) === req.params.id);
        if (index === -1) return null;
        const [removed] = memoryStore.products.splice(index, 1);
        return removed;
      })();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully" });
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
