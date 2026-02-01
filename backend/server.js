require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

// Session middleware (MUST be before routes)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "facet-secret-key-2025",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  }),
);

// CORS configuration
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5177",
  "http://localhost:5179",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / curl
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  }),
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FACET API is running",
    endpoints: {
      auth: {
        test: "GET /api/auth/test",
        login: "POST /api/auth/login",
        signup: "POST /api/auth/signup",
        logout: "GET /api/auth/logout",
        check: "GET /api/auth/check",
      },
      admin: {
        courses: "GET /api/admin/courses",
        dashboard: "GET /api/admin/dashboard",
      },
    },
  });
});

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes"); // ✅ ito yung nasa screenshot mo

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


const studentRoutes = require('./src/routes/studentRoutes');
app.use('/api/student', studentRoutes);

// Protected route example
app.get("/api/protected", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
      redirect: "/login.html",
    });
  }

  res.json({
    status: "success",
    message: "Welcome to protected route",
    user: {
      id: req.session.user_id,
      name: req.session.fullname,
      role: req.session.role,
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
