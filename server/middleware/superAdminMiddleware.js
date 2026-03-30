module.exports = function superAdminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access required" });
  }

  return next();
};
