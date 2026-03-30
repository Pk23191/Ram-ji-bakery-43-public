const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { memoryStore } = require("../data/memoryStore");

async function getAdmins(req, res) {
  const admins = memoryStore.dbConnected
    ? await Admin.find().select("-password").sort({ createdAt: -1 })
    : memoryStore.admins.map(({ password, ...admin }) => admin);

  return res.json(admins);
}

async function createAdmin(req, res) {
  const { email, password, role = "admin" } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!["admin", "superadmin"].includes(role)) {
    return res.status(400).json({ message: "Role must be admin or superadmin" });
  }

  const existingAdmin = memoryStore.dbConnected
    ? await Admin.findOne({ email: email.trim().toLowerCase() })
    : memoryStore.admins.find((admin) => admin.email === email.trim().toLowerCase());

  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const payload = {
    email: email.trim().toLowerCase(),
    password: passwordHash,
    role
  };

  const admin = memoryStore.dbConnected
    ? await Admin.create(payload)
    : { ...payload, _id: `memory-admin-${Date.now()}` };

  if (!memoryStore.dbConnected) {
    memoryStore.admins.unshift(admin);
  }

  return res.status(201).json({
    message: "Admin created successfully",
    admin: {
      _id: admin._id,
      email: admin.email,
      role: admin.role
    }
  });
}

async function deleteAdmin(req, res) {
  const adminId = req.params.id;

  const admin = memoryStore.dbConnected
    ? await Admin.findById(adminId)
    : memoryStore.admins.find((item) => String(item._id) === adminId);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  if (String(admin._id) === String(req.user.id)) {
    return res.status(400).json({ message: "You cannot remove your own account" });
  }

  if (admin.role === "superadmin") {
    return res.status(400).json({ message: "Superadmin cannot be removed from this screen" });
  }

  if (memoryStore.dbConnected) {
    await Admin.findByIdAndDelete(adminId);
  } else {
    memoryStore.admins = memoryStore.admins.filter((item) => String(item._id) !== adminId);
  }

  return res.json({ message: "Admin removed successfully" });
}

module.exports = {
  getAdmins,
  createAdmin,
  deleteAdmin
};
