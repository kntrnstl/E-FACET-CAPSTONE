// backend/src/middlewares/authMiddleware.js

function getSessionUserId(req) {
  // support different possible keys just in case
  const v = req?.session?.user_id ?? req?.session?.userId ?? req?.session?.id;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getSessionRole(req) {
  return String(req?.session?.role || "")
    .trim()
    .toLowerCase();
}

const requireAuth = (req, res, next) => {
  const userId = getSessionUserId(req);
  if (userId) return next();

  return res.status(401).json({
    status: "error",
    message: "Not authenticated",
    redirect: "/login",
  });
};

const requireAdmin = (req, res, next) => {
  const userId = getSessionUserId(req);
  const role = getSessionRole(req);

  if (userId && role === "admin") return next();

  // if not logged in -> 401, else -> 403
  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
      redirect: "/login",
    });
  }

  return res.status(403).json({
    status: "error",
    message: "Admin access required",
    redirect: "/login",
  });
};

const requireInstructor = (req, res, next) => {
  const userId = getSessionUserId(req);
  const role = getSessionRole(req);

  if (userId && role === "instructor") return next();

  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
      redirect: "/login",
    });
  }

  return res.status(403).json({
    status: "error",
    message: "Instructor access required",
    redirect: "/login",
  });
};

// optional: for students/users
const requireStudent = (req, res, next) => {
  const userId = getSessionUserId(req);
  const role = getSessionRole(req);

  if (userId && (role === "student" || role === "user")) return next();

  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
      redirect: "/login",
    });
  }

  return res.status(403).json({
    status: "error",
    message: "Student access required",
    redirect: "/login",
  });
};

const requireTrainer = (req, res, next) => {
  const userId = getSessionUserId(req);
  const role = getSessionRole(req);

  if (userId && role === "trainer") return next();

  if (!userId) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
      redirect: "/login",
    });
  }

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
