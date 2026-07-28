const path = require("path");
const { cloudinary, getCloudinaryConfigError, uploadImageBuffer } = require("../config/cloudinary");
const { readJson, writeJson } = require("../utils/fileStore");

const IMAGES_FILE = path.join(__dirname, "..", "data", "images.json");

function makeImageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeImage(image = {}) {
  const id = String(image._id || image.id || makeImageId());

  return {
    ...image,
    _id: id,
    id,
    url: String(image.url || ""),
    publicId: String(image.publicId || ""),
    originalName: String(image.originalName || ""),
    createdAt: image.createdAt || new Date().toISOString()
  };
}

function getRequestFiles(req) {
  if (Array.isArray(req.files)) return req.files;
  if (req.file) return [req.file];
  if (req.files && typeof req.files === "object") {
    return [...(req.files.images || []), ...(req.files.image || [])];
  }
  return [];
}

async function readImages() {
  const images = await readJson(IMAGES_FILE, []);
  return images.map((image) => normalizeImage(image));
}

async function writeImages(images) {
  await writeJson(IMAGES_FILE, images.map((image) => normalizeImage(image)));
}

async function uploadImages(req, res) {
  try {
    const configError = getCloudinaryConfigError();
    if (configError) {
      return res.status(500).json({
        message: `${configError} Image upload is blocked until Cloudinary is configured.`
      });
    }

    const files = getRequestFiles(req).slice(0, 4);
    if (!files.length) {
      return res.status(400).json({ message: 'No image file uploaded. Use the "images" field.' });
    }

    const uploaded = await Promise.all(
      files.map((file, index) =>
        uploadImageBuffer(file.buffer, {
          folder: "ramji-bakery/uploads",
          public_id: `rb-upload-${Date.now()}-${index + 1}`
        })
      )
    );

    const newImages = uploaded.map((asset, index) =>
      normalizeImage({
        _id: makeImageId(),
        url: asset.secure_url,
        publicId: asset.public_id,
        originalName: files[index]?.originalname || "",
        createdAt: new Date().toISOString()
      })
    );

    const images = await readImages();
    await writeImages([...newImages, ...images]);

    return res.status(201).json({
      message: "Images uploaded successfully",
      images: newImages
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    return res.status(500).json({ message: error.message || "Image upload failed" });
  }
}

async function listImages(req, res) {
  try {
    const images = await readImages();
    images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(images);
  } catch (error) {
    console.error("List images failed:", error);
    return res.status(500).json({ message: "Unable to load images" });
  }
}

async function deleteImage(req, res) {
  try {
    const images = await readImages();
    const image = images.find((item) => item._id === req.params.id || item.id === req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    if (image.publicId && cloudinary?.uploader) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error("Cloudinary delete failed:", error);
      }
    }

    await writeImages(images.filter((item) => item._id !== image._id && item.id !== image.id));

    return res.json({ message: "Image deleted", imageId: image._id });
  } catch (error) {
    console.error("Delete image failed:", error);
    return res.status(500).json({ message: "Unable to delete image" });
  }
}

module.exports = {
  uploadImages,
  listImages,
  deleteImage
};
