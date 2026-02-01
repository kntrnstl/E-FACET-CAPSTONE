// src/middlewares/authMiddleware.js

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user_id) return next();
  return res.status(401).json({
    status: "error",
    message: "Not authenticated",
    redirect: "/login.html",
  });
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user_id && req.session.role === "admin")
    return next();
  return res.status(403).json({
    status: "error",
    message: "Admin access required",
    redirect: "/login.html",
  });
};

module.exports = { requireAuth, requireAdmin };
