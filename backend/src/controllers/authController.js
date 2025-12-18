const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Login function with session
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    const identity = username.trim();

    const [users] = await pool.execute(
      'SELECT id, username, password, role, fullname FROM users WHERE username = ? OR email = ? LIMIT 1',
      [identity, identity]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Account not found'
      });
    }

    const user = users[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password'
      });
    }

    // Set session data
    req.session.user_id = user.id;
    req.session.username = user.username;
    req.session.fullname = user.fullname;
    req.session.role = user.role;

    const userSession = {
      user_id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role
    };

    const redirect = user.role === 'admin' 
      ? '/admin-dashboard' 
      : '/student-panel/student-dashboard.html';

    return res.json({
      status: 'success',
      redirect: redirect,
      user: userSession
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Check authentication status
const checkAuth = (req, res) => {
  try {
    if (req.session && req.session.user_id) {
      return res.json({
        status: 'success',
        authenticated: true,
        user: {
          user_id: req.session.user_id,
          username: req.session.username,
          fullname: req.session.fullname,
          role: req.session.role
        }
      });
    } else {
      return res.json({
        status: 'error',
        authenticated: false,
        message: 'Not authenticated',
        redirect: '/login.html'
      });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error checking authentication'
    });
  }
};

// Admin-only check
const checkAdmin = (req, res) => {
  try {
    if (req.session && req.session.user_id && req.session.role === 'admin') {
      return res.json({
        status: 'success',
        isAdmin: true,
        user: {
          user_id: req.session.user_id,
          username: req.session.username,
          fullname: req.session.fullname
        }
      });
    } else {
      return res.json({
        status: 'error',
        isAdmin: false,
        message: 'Admin access required',
        redirect: '/login.html'
      });
    }
  } catch (error) {
    console.error('Check admin error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error checking admin status'
    });
  }
};

// Signup function
const signup = async (req, res) => {
  try {
    const { fullname, username, email, contact, password, confirm } = req.body;

    // Trim inputs
    const fullnameTrimmed = (fullname || '').trim();
    const usernameTrimmed = (username || '').trim();
    const emailTrimmed = (email || '').trim();
    const contactTrimmed = (contact || '').trim();

    const errors = {};

    // Validation
    if (!fullnameTrimmed) errors.fullname = 'Full name is required';
    if (!usernameTrimmed) errors.username = 'Username is required';
    if (!emailTrimmed) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!confirm) errors.confirm = 'Confirm password is required';

    if (password && confirm && password !== confirm) {
      errors.confirm = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: 'error',
        errors: errors
      });
    }

    // Check if username or email exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [emailTrimmed, usernameTrimmed]
    );

    if (existingUsers.length > 0) {
      errors.general = 'Email or Username already exists';
      return res.status(400).json({
        status: 'error',
        errors: errors
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (fullname, username, email, password, contact, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullnameTrimmed, usernameTrimmed, emailTrimmed, hashedPassword, contactTrimmed, 'user']
    );

    return res.json({
      status: 'success',
      message: 'Account created successfully!',
      user: {
        id: result.insertId,
        fullname: fullnameTrimmed,
        username: usernameTrimmed,
        email: emailTrimmed,
        contact: contactTrimmed,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      status: 'error',
      errors: {
        general: 'Something went wrong. Try again'
      }
    });
  }
};

// Check username availability
const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Username cannot be empty'
      });
    }

    const trimmedUsername = username.trim();

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [trimmedUsername]
    );

    if (users.length > 0) {
      return res.json({
        status: 'taken',
        message: 'Username already taken'
      });
    } else {
      return res.json({
        status: 'available',
        message: 'Username available'
      });
    }
  } catch (error) {
    console.error('Check username error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Logout function
const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Logout failed'
        });
      }
      
      res.clearCookie('connect.sid');
      
      return res.json({
        status: 'success',
        message: 'Logged out successfully',
        redirect: '/login.html'
      });
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during logout'
    });
  }
};

// Test endpoint
const test = (req, res) => {
  res.json({ 
    message: 'Auth API is working',
    sessionInfo: req.sessionID ? {
      sessionId: req.sessionID,
      userId: req.session.user_id || 'No user'
    } : 'No session'
  });
};

module.exports = {
  login,
  signup,
  logout,
  checkAuth,
  checkAdmin,
  checkUsername,
  test
};