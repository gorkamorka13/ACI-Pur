const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Function to generate a random hex color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to get contrasting text color (simple black/white)
function getContrastColor(hexColor) {
  if (!hexColor) return '#000000'; // Default to black if no color
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF'; // Black for light backgrounds, White for dark
}

// Function to generate initials from username or email
function getInitials(username, email) {
    let initials = '??'; // Default initials
    if (username) {
        const nameParts = username.split(/[\s_-]+/); // Split by space, underscore, hyphen
        if (nameParts.length >= 2) {
            initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
        } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
            initials = nameParts[0].substring(0, 2);
        } else if (nameParts.length === 1 && nameParts[0].length === 1) {
            initials = nameParts[0][0];
        }
    } else if (email) {
        initials = email.substring(0, 2); // Fallback to first two letters of email
    }
    return initials.toUpperCase();
}


async function generateAvatar(userId, username, email) {
  const avatarSize = 200; // Size of the avatar image (width & height)
  const canvas = createCanvas(avatarSize, avatarSize);
  const ctx = canvas.getContext('2d');

  // Generate background color and text color
  const backgroundColor = getRandomColor();
  const textColor = getContrastColor(backgroundColor);

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, avatarSize, avatarSize);

  // Prepare text
  const initials = getInitials(username, email);
  const fontSize = Math.floor(avatarSize / 2); // Adjust font size based on avatar size
  ctx.font = `bold ${fontSize}px Arial`; // Use a common font
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw initials
  ctx.fillText(initials, avatarSize / 2, avatarSize / 2);

  // Define file path
  const imagesDir = path.join(__dirname, '../../images'); // Navigate up from js/utils to root, use 'images' dir
  const filename = `user-${userId}-generated-${Date.now()}.png`;
  const filePath = path.join(imagesDir, filename);
  const relativePath = `/images/${filename}`; // Path to be stored in DB and used in src, use '/images' route

  // Ensure directory exists (should be created by server.js, but good practice)
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Save canvas to file
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated avatar saved to: ${filePath}`);
    return relativePath; // Return the web-accessible path
  } catch (error) {
    console.error('Error saving generated avatar:', error);
    return null; // Return null if saving failed
  }
}

module.exports = { generateAvatar };
