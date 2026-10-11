const jwt = require('jsonwebtoken');

// Checks the token sent in the Authorization header
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please log in again' });
  }
}

// Only lets one role through, e.g. only('recruiter')
function only(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'You are not allowed to do this' });
    }
    next();
  };
}

// Lets async routes send their errors to the error handler
function wrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = { auth, only, wrap };
