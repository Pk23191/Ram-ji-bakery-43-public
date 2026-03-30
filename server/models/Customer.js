const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
