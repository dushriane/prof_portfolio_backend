const express = require('express');
const BlogPost = require('../models/BlogPost');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ published: true });
    const draftPosts = await BlogPost.countDocuments({ published: false });
    
    // Calculate total views
    const posts = await BlogPost.find({ published: true });
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    
    // Get recent posts
    const recentPosts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title published createdAt');

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      recentPosts
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
});

// Get posts for dashboard management
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, published } = req.query;
    
    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (published !== undefined) {
      query.published = published === 'true';
    }

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title slug excerpt imageUrl tags category published publishedAt views createdAt');

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Get categories for filtering
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await BlogPost.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

module.exports = router; 