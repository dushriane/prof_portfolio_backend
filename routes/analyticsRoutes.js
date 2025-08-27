const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middlewares/auth');

// router.get('/', auth, analyticsController.getAnalytics);

// GET /api/analytics
router.get('/', auth, async (req, res) => {
  try {
    const { timeRange = '30' } = req.query;
    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get posts within time range
    const posts = await Post.find({
      createdAt: { $gte: startDate },
      published: true
    }).populate('author', 'username');

    // Calculate analytics
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalPosts = posts.length;
    const engagementRate = totalPosts > 0 ? (totalViews / totalPosts).toFixed(2) : 0;

    // Generate chart data (daily views for the period)
    const chartData = [];
    const chartLabels = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayPosts = posts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.toDateString() === date.toDateString();
      });
      const dayViews = dayPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      
      chartLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      chartData.push(dayViews);
    }

    // Get top posts
    const topPosts = await Post.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .populate('author', 'username')
      .select('title views category');

    res.json({
      totalViews,
      engagementRate: parseFloat(engagementRate),
      newReaders: Math.floor(totalViews * 0.3), // Estimate new readers
      topPosts,
      chartLabels,
      chartData
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router;