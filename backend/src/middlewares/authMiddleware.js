// src/middlewares/authMiddleware.js

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user_id) return next();
  return res.status(401).json({
    status: "error",
    message: "Not authenticated",
    redirect: "/login",
  });
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user_id && req.session.role === "admin")
    return next();
  return res.status(403).json({
    status: "error",
    message: "Admin access required",
    redirect: "/login",
  });
};

const requireInstructor = (req, res, next) => {
  if (req.session && req.session.user_id && req.session.role === "instructor")
    return next();
  return res.status(403).json({
    status: "error",
    message: "Instructor access required",
    redirect: "/login",
  });
};

// optional: for students/users
const requireStudent = (req, res, next) => {
  if (
    req.session &&
    req.session.user_id &&
    (req.session.role === "student" || req.session.role === "user")
  )
    return next();

  return res.status(403).json({
    status: "error",
    message: "Student access required",
    redirect: "/login",
  });
};

const requireTrainer = (req, res, next) => {
  if (req.session && req.session.user_id && req.session.role === "trainer")
    return next();

  return res.status(403).json({
    status: "error",
    message: "Trainer access required",
    redirect: "/login",
  });
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireInstructor,
  requireStudent,
  requireTrainer,
};
