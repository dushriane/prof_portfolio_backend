const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middlewares/auth');

// Users
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Posts
router.get('/posts', adminAuth, adminController.getAllPosts);
router.post('/posts/:id/hide', adminAuth, adminController.hidePost);

// Comments
router.get('/comments', adminAuth, adminController.getAllComments);
router.post('/comments/:id/hide', adminAuth, adminController.hideComment);

// Dashboard Stats
// router.get('/dashboard/stats', adminAuth, userController.getDashboardStats);

// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalCategories = await Category.countDocuments();
    
    // Calculate engagement rate
    const publishedPosts = await Post.countDocuments({ published: true });
    const views = totalViews.length > 0 ? totalViews[0].total : 0;
    const engagementRate = publishedPosts > 0 ? ((views / publishedPosts) * 0.1).toFixed(1) + '%' : '0%';

    res.json({
      totalPosts,
      totalViews: views || 0,
      totalCategories,
      engagementRate
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router;
