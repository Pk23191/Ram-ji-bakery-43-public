const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const { memoryStore } = require("../data/memoryStore");

async function login(req, res) {
  const { email, password } = req.body;
  const admin = memoryStore.dbConnected
    ? await Admin.findOne({ email })
    : memoryStore.admins.find((item) => item.email === email);

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = memoryStore.dbConnected
    ? await bcrypt.compare(password, admin.password)
    : admin.password.startsWith("$2")
      ? await bcrypt.compare(password, admin.password)
      : password === admin.password;
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role || "admin" },
    process.env.JWT_SECRET || "ramji-bakery-dev-secret",
    { expiresIn: "1d" }
  );
  return res.json({ token, admin: { email: admin.email, role: admin.role || "admin" } });
}

async function customerLogin(req, res) {
  const { name, phone } = req.body;

  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const normalizedPhone = phone.trim();
  const normalizedName = name.trim();

  const customer = memoryStore.dbConnected
    ? await Customer.findOneAndUpdate(
        { phone: normalizedPhone },
        { name: normalizedName, phone: normalizedPhone, role: "customer" },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    : (() => {
        const existing = memoryStore.customers.find((item) => item.phone === normalizedPhone);
        if (existing) {
          existing.name = normalizedName;
          return existing;
        }

        const created = {
          _id: `memory-customer-${Date.now()}`,
          name: normalizedName,
          phone: normalizedPhone,
          role: "customer"
        };
        memoryStore.customers.unshift(created);
        return created;
      })();

  const token = jwt.sign(
    { id: customer._id, name: normalizedName, phone: normalizedPhone, role: "customer" },
    process.env.JWT_SECRET || "ramji-bakery-dev-secret",
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    customer: {
      id: customer._id,
      name: normalizedName,
      phone: normalizedPhone,
      role: "customer"
    }
  });
}

module.exports = { login, customerLogin };
