const path = require("path");
const { readJson, writeJson } = require("../utils/fileStore");
const {
  getCloudinaryConfigError,
  uploadImageBuffer
} = require("../config/cloudinary");

const BANNERS_FILE = path.join(__dirname, "..", "data", "banners.json");

async function getBanners() {
  return readJson(BANNERS_FILE, []);
}

async function saveBanners(banners) {
  await writeJson(BANNERS_FILE, banners);
}

/**
 * GET /api/banner
 * Returns the latest active banner (public, no auth required).
 */
async function getActiveBanner(req, res) {
  const banners = await getBanners();
  const active = banners.find((b) => b.isActive);
  if (!active) {
    return res.json(null);
  }
  return res.json(active);
}

/**
 * GET /api/banner/all
 * Returns all banners (admin only).
 */
async function getAllBanners(req, res) {
  const banners = await getBanners();
  return res.json(banners);
}

/**
 * POST /api/banner/upload
 * Upload a new banner image to Cloudinary and save metadata.
 * Expects multipart form with "image" file field and optional "title" text field.
 * Automatically deactivates previous banners and sets the new one as active.
 */
async function uploadBanner(req, res) {
  const configError = getCloudinaryConfigError();
  if (configError) {
    return res.status(500).json({
      message: `${configError} Banner upload is blocked until Cloudinary is configured.`
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No image file uploaded. Use the "image" field.' });
  }

  const result = await uploadImageBuffer(file.buffer, {
    folder: "ramji-bakery/banners",
    public_id: `banner-${Date.now()}`
  });

  const banners = await getBanners();

  // Deactivate all existing banners
  banners.forEach((b) => {
    b.isActive = false;
  });

  const newBanner = {
    id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: (req.body.title || "Homepage Banner").trim(),
    image: result.secure_url,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  banners.push(newBanner);
  await saveBanners(banners);

  return res.status(201).json({
    message: "Banner uploaded successfully",
    banner: newBanner
  });
}

/**
 * DELETE /api/banner/:id
 * Delete a banner by ID (admin only).
 */
async function deleteBanner(req, res) {
  const { id } = req.params;
  let banners = await getBanners();
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Banner not found" });
  }

  banners.splice(index, 1);
  await saveBanners(banners);

  return res.json({ message: "Banner deleted" });
}

/**
 * PATCH /api/banner/:id/activate
 * Set a specific banner as the active one (admin only).
 */
async function activateBanner(req, res) {
  const { id } = req.params;
  const banners = await getBanners();
  const target = banners.find((b) => b.id === id);
  if (!target) {
    return res.status(404).json({ message: "Banner not found" });
  }

  banners.forEach((b) => {
    b.isActive = b.id === id;
  });

  await saveBanners(banners);

  return res.json({ message: "Banner activated", banner: target });
}

module.exports = {
  getActiveBanner,
  getAllBanners,
  uploadBanner,
  deleteBanner,
  activateBanner
};
