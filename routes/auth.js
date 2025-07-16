const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer setup for profile picture upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../frontend/images/profiles'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Register user (admin or regular)
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;
    let profilePicture = '';
    if (req.file) {
      profilePicture = '/images/profiles/' + req.file.filename;
    }
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [ { username }, { email } ] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with that username or email already exists' });
    }
    // Create user
    const user = new User({
      username,
      email,
      password,
      bio,
      profilePicture,
      role: 'user'
    });
    await user.save();
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login (by username or email)
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Find user by username or email
    const user = await User.findOne({ $or: [ { username }, { email } ] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
        profilePicture: req.user.profilePicture,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

module.exports = router; 