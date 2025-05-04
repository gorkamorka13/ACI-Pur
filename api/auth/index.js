const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const fs = require('fs'); // Import fs for potential file operations (like checking default)
const db = require('../../models'); // Adjust path based on your models/index.js location
const { generateAvatar } = require('../../js/utils/avatarGenerator'); // Import avatar generator
const router = express.Router();

const SALT_ROUNDS = 10; // Cost factor for bcryptjs hashing
const IMAGES_DIR = path.join(__dirname, '../../images'); // Define images directory path
const DEFAULT_AVATAR_PATH = '/images/default_avatar.png'; // Define default avatar path using new route

// Ensure images directory exists (redundant if server.js does it, but safe)
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGES_DIR); // Set destination directory to 'images'
  },
  filename: function (req, file, cb) {
    // Generate a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1); // Exit if secret is missing
}

// POST /api/auth/register - Apply multer middleware for single file upload named 'avatar'
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { email, username, password } = req.body;

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
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await db.User.create({
      email: email,
      username: username, // Add username
      password: hashedPassword,
      // Avatar will be added in the next step
    });

    // Determine avatar path
    let avatarPath = null;
    if (req.file) {
      // User uploaded an avatar
      avatarPath = `/images/${req.file.filename}`; // Use the generated filename with new route
      console.log(`User ${newUser.id} uploaded avatar: ${avatarPath}`);
    } else {
      // No avatar uploaded, try to generate one
      console.log(`No avatar uploaded for user ${newUser.id}, attempting generation...`);
      try {
        avatarPath = await generateAvatar(newUser.id, username, email);
        if (!avatarPath) {
            console.warn(`Avatar generation failed for user ${newUser.id}, using default.`);
            avatarPath = DEFAULT_AVATAR_PATH; // Fallback to default if generation returns null
        } else {
            console.log(`Generated avatar for user ${newUser.id}: ${avatarPath}`);
        }
      } catch (genError) {
          console.error(`Error during avatar generation for user ${newUser.id}:`, genError);
          avatarPath = DEFAULT_AVATAR_PATH; // Fallback to default on error
      }
    }

    // Update the user record with the avatar path
    await newUser.update({ avatar: avatarPath });

    // Don't send password back, even hashed
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar: avatarPath, // Include avatar path in response
        message: 'User registered successfully.'
    });

  } catch (error) {
    console.error("Registration Error:", error);
    // Handle multer errors specifically if needed
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    } else if (error.message === 'Not an image! Please upload an image file.') {
        return res.status(400).json({ message: error.message });
    }
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
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use generic message
    }

    // Passwords match - Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar // Include avatar in JWT payload
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
