const path = require('path');
// const cloudinary = require('../config/cloudinary'); // Uncomment if using cloudinary
const fs = require('fs');

exports.uploadImage = async (req, res) => {
  try {
    // If using multer for local upload
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      return res.status(201).json({ imageUrl });
    }
    // If using cloudinary
    // if (req.file && req.file.path) {
    //   const result = await cloudinary.uploader.upload(req.file.path);
    //   return res.status(201).json({ imageUrl: result.secure_url });
    // }
    res.status(400).json({ error: 'No image uploaded' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading image' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });
    // Local file deletion
    const filePath = path.join(__dirname, '../../', imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'Image deleted' });
    }
    // Cloudinary deletion stub
    // await cloudinary.uploader.destroy(publicId);
    res.status(404).json({ error: 'Image not found' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting image' });
  }
};
