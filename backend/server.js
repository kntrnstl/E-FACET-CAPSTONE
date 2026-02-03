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

  // ✅ allow Vite localhost ports like 5173..5199
  if (/^http:\/\/localhost:51\d{2}$/.test(origin)) return true;

  // Optional: allow 127.0.0.1 too
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

// ✅ preflight
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
// Routes
// ==============================
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const instructorRoutes = require("./src/routes/instructorRoutes"); // ✅ ADD THIS

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes); // ✅ ADD THIS

// ==============================
// Test route
// ==============================
app.get("/", (req, res) => {
  res.json({
    message: "FACET API is running",
    endpoints: {
      auth: "/api/auth/*",
      admin: "/api/admin/*",
      student: "/api/student/*",
      instructor: "/api/instructor/*",
    },
  });
});

// ==============================
// 404 handler (JSON)
// ==============================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==============================
// Error handler (JSON)
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
