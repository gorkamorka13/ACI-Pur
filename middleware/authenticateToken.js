const jwt = require('jsonwebtoken');
const db = require('../models'); // Adjust path based on your models/index.js location

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1); // Exit if secret is missing
}

function authenticateToken(req, res, next) {
  // --- Development Bypass ---
  if (process.env.NODE_ENV === 'development') {
    console.log('DEV MODE: Bypassing authentication.');
    // Define a mock user for development.
    // You might want to fetch a real user from the DB here if needed for testing specific user data/roles.
    // For now, a simple mock user object is sufficient.
    req.user = { id: 'dev-user-id', email: 'dev@example.com' };
    return next(); // Skip token check
  }
  // --- End Development Bypass ---

  // --- Standard Production Authentication ---
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    console.log('Authentication failed: No token provided.');
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.sendStatus(403); // Token is invalid or expired
    }
    req.user = user; // Attach decoded user payload
    next(); // proceed to the protected route
  });
}

module.exports = authenticateToken;
