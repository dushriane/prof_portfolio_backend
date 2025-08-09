const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Multer config for local uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Image upload endpoint
router.post('/upload-image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the relative path or a URL to the uploaded image
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

router.post('/', auth, upload.single('image'), uploadController.uploadImage);
router.post('/delete', auth, uploadController.deleteImage);

module.exports = router;
