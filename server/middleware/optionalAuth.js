const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "ramji-bakery-dev-secret");
  } catch (error) {
    // Ignore invalid tokens for optional auth.
    console.warn("Optional auth: token invalid", error && error.message ? error.message : error);
  }

  return next();
};
