const path = require("path");
const crypto = require("crypto");
const { readJson, writeJson } = require("../utils/fileStore");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

function buildAppUrl(pathname = "") {
  const base = process.env.PUBLIC_STORE_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${pathname}`;
}

function createEmailVerificationFields() {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    emailVerificationToken: token,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
    verificationLink: buildAppUrl(`/verify-email?token=${encodeURIComponent(token)}`)
  };
}

async function listUsers(req, res) {
  try {
    const users = await readJson(USERS_FILE, []);
    return res.json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "customer",
        emailVerified: Boolean(user.emailVerified)
      }))
    );
  } catch (error) {
    console.error("List users failed:", error);
    return res.status(500).json({ message: "Unable to load users" });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const users = await readJson(USERS_FILE, []);
    const existing = users.find((user) => user.id === userId);

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const filtered = users.filter((user) => user.id !== userId);
    await writeJson(USERS_FILE, filtered);
    return res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Delete user failed:", error);
    return res.status(500).json({ message: "Unable to delete user" });
  }
}

async function verifyEmail(req, res) {
  try {
    const token = String(req.body.token || "").trim();

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const users = await readJson(USERS_FILE, []);
    const index = users.findIndex(
      (user) => user.emailVerificationToken === token && Number(user.emailVerificationExpires || 0) > Date.now()
    );

    if (index < 0) {
      return res.status(400).json({ message: "Verification token is invalid or expired" });
    }

    users[index] = {
      ...users[index],
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date().toISOString()
    };

    await writeJson(USERS_FILE, users);

    return res.json({
      message: "Email verified",
      user: {
        id: users[index].id,
        name: users[index].name,
        email: users[index].email,
        role: users[index].role || "customer",
        emailVerified: true
      }
    });
  } catch (error) {
    console.error("Verify email failed:", error);
    return res.status(500).json({ message: "Unable to verify email" });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const users = await readJson(USERS_FILE, []);
    const index = users.findIndex((user) => user.id === req.user.id);

    if (index < 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (users[index].emailVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const verification = createEmailVerificationFields();
    users[index] = {
      ...users[index],
      emailVerificationToken: verification.emailVerificationToken,
      emailVerificationExpires: verification.emailVerificationExpires,
      updatedAt: new Date().toISOString()
    };

    await writeJson(USERS_FILE, users);

    console.log("Email verification link generated:", {
      email: users[index].email,
      verificationLink: verification.verificationLink
    });

    return res.json({
      message: "Verification email sent",
      verificationLink: verification.verificationLink
    });
  } catch (error) {
    console.error("Resend verification failed:", error);
    return res.status(500).json({ message: "Unable to resend verification email" });
  }
}

async function updateUserRole(req, res) {
  try {
    const userId = req.params.id;
    const role = ["customer", "admin"].includes(req.body.role) ? req.body.role : "customer";
    const users = await readJson(USERS_FILE, []);
    const index = users.findIndex((user) => user.id === userId);

    if (index < 0) {
      return res.status(404).json({ message: "User not found" });
    }

    users[index] = {
      ...users[index],
      role,
      updatedAt: new Date().toISOString()
    };

    await writeJson(USERS_FILE, users);
    return res.json({ message: "User role updated", user: users[index] });
  } catch (error) {
    console.error("Update user role failed:", error);
    return res.status(500).json({ message: "Unable to update user role" });
  }
}

module.exports = {
  listUsers,
  deleteUser,
  verifyEmail,
  resendVerificationEmail,
  updateUserRole
};
