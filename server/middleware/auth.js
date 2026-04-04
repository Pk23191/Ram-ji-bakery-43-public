const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "ramji-bakery-dev-secret");
    return next();
  } catch (error) {
    console.error("Token verification failed:", error && error.message ? error.message : error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
