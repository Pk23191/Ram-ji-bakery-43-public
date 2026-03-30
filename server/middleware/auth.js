const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "ramji-bakery-dev-secret");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
