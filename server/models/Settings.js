const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    gstEnabled: {
      type: Boolean,
      default: false
    },
    gstRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
