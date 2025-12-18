require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const app = express();

// Session middleware (MUST be before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'facet-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'FACET API is running',
    endpoints: {
      auth: {
        test: 'GET /api/auth/test',
        login: 'POST /api/auth/login',
        signup: 'POST /api/auth/signup',
        logout: 'GET /api/auth/logout',
        check: 'GET /api/auth/check'
      }
    }
  });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated',
      redirect: '/login.html'
    });
  }
  
  res.json({
    status: 'success',
    message: 'Welcome to protected route',
    user: {
      id: req.session.user_id,
      name: req.session.fullname,
      role: req.session.role
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});