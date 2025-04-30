const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../models'); // Adjust path based on your models/index.js location
const router = express.Router();

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1); // Exit if secret is missing
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body; // Add username

    // Basic validation
    if (!email || !username || !password) { // Check for username
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }
    if (password.length < 6) { // Example: Minimum password length
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Add username validation (e.g., length, characters) if desired

    // Check if email or username already exists
    const existingUserByEmail = await db.User.findOne({ where: { email: email } });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Email already in use.' }); // 409 Conflict
    }
    const existingUserByUsername = await db.User.findOne({ where: { username: username } });
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Username already in use.' }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await db.User.create({
      email: email,
      username: username, // Add username
      password: hashedPassword,
    });

    // Don't send password back, even hashed
    res.status(201).json({ id: newUser.id, email: newUser.email, username: newUser.username, message: 'User registered successfully.' }); // Include username in response

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body; // Use loginIdentifier (email or username)

    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    // Determine if loginIdentifier is email or username
    const isEmail = loginIdentifier.includes('@'); // Simple check
    const whereClause = isEmail ? { email: loginIdentifier } : { username: loginIdentifier };

    // Find user by email or username
    const user = await db.User.findOne({ where: whereClause });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use generic message
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use generic message
    }

    // Passwords match - Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username, // Include username in payload
      // Add other non-sensitive info if needed (e.g., roles)
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' } // Example: Token expires in 1 hour
    );

    res.status(200).json({ token: token, message: 'Login successful.' });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

module.exports = router;
