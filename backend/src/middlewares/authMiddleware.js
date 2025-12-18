const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user_id) {
    next();
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated',
      redirect: '/login.html'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.session && req.session.user_id && req.session.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      redirect: '/login.html'
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};