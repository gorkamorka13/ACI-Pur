const jwt = require('jsonwebtoken');
const db = require('../models'); // Adjust path based on your models/index.js location

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1); // Exit if secret is missing
}

function authenticateToken(req, res, next) {
  // --- Standard Authentication ---
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
    // Fetch the user from the database to ensure they still exist and get their current details
    db.User.findByPk(user.id)
      .then(foundUser => {
        if (!foundUser) {
          console.error('JWT Verification Error: User not found in DB.');
          return res.sendStatus(401); // User not found
        }
        // Attach the actual user object from the database to the request
        req.user = foundUser;
        next(); // proceed to the protected route
      })
      .catch(dbError => {
        console.error('Database error during JWT verification:', dbError);
        res.sendStatus(500); // Internal server error
      });
  });
}

module.exports = authenticateToken;
