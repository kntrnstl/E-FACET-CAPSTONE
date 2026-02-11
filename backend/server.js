require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

// ==============================
// CORS (put BEFORE routes)
// ==============================
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5177",
  "http://localhost:5179",
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // Postman / curl
  if (allowedOrigins.has(origin)) return true;

  // allow Vite localhost ports like 5173..5199
  if (/^http:\/\/localhost:51\d{2}$/.test(origin)) return true;

  // allow 127.0.0.1 too
  if (/^http:\/\/127\.0\.0\.1:51\d{2}$/.test(origin)) return true;

  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  }),
);

// preflight
app.options(/.*/, cors());

// ==============================
// Body parsers
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Session middleware (MUST be before routes)
// ==============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "facet-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only if HTTPS
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      // sameSite: "lax",
    },
  }),
);

// ==============================
// Static uploads
// ==============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==============================
// Routes (IMPORTS)
// ==============================
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const instructorRoutes = require("./src/routes/instructorRoutes");
const trainerRoutes = require("./src/routes/trainerRoutes");
const adminTesdaRoutes = require("./src/routes/adminTesdaRoutes");
const tesdaPublicRoutes = require("./src/routes/tesdaPublicRoutes"); // ✅ FIXED PATH

const studentResCtrl = require("./src/controllers/studentReservationController");

// ==============================
// Auto mark DONE reservations
// ==============================
setInterval(async () => {
  try {
    const changed = await studentResCtrl.autoMarkDone();
    if (changed > 0) console.log(`[autoDone] marked DONE: ${changed}`);
  } catch (err) {
    console.error("autoMarkDone error:", err);
  }
}, 120000);

// ==============================
// Routes (MOUNT)
// ORDER IS IMPORTANT
// ==============================

// TESDA
app.use("/api/admin/tesda", adminTesdaRoutes); // admin only
app.use("/api/tesda", tesdaPublicRoutes); // public/student

// Core system
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/trainer", trainerRoutes);

// ==============================
// DEBUG: check session
// ==============================
app.get("/api/debug/session", (req, res) => {
  res.json({
    user: req.session?.user || null,
    sid: req.sessionID,
  });
});

// ==============================
// Root test route
// ==============================
app.get("/", (req, res) => {
  res.json({
    message: "FACET API is running",
    endpoints: {
      auth: "/api/auth/*",
      admin: "/api/admin/*",
      student: "/api/student/*",
      instructor: "/api/instructor/*",
      trainer: "/api/trainer/*",
      tesda_public: "/api/tesda/*",
      tesda_admin: "/api/admin/tesda/*",
    },
  });
});

// ==============================
// 404 handler (MUST be last before error handler)
// ==============================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==============================
// Error handler
// ==============================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  const msg = err?.message || "Internal Server Error";
  const status = msg.startsWith("Not allowed by CORS") ? 403 : 500;

  res.status(status).json({
    status: "error",
    message: msg,
  });
});

// ==============================
// Start server
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
