const mongoose = require("mongoose");

const PRODUCT_CATEGORIES = ["cake", "pastry", "party", "balloons", "ribbons", "candles", "hats", "banners"];

const productColorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
      lowercase: true,
      trim: true
    },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    images: {
      type: [{ type: String, trim: true }],
      default: []
    },
    colors: {
      type: [productColorSchema],
      default: []
    },
    badge: { type: String, default: "Fresh" },
    rating: { type: Number, default: 4.7 },
    flavors: [{ type: String }]
  },
  { timestamps: true }
);

productSchema.statics.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

module.exports = mongoose.model("Product", productSchema);
