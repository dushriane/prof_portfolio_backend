const Post = require('../models/Post');
const Comment = require('../models/Comment'); // If you have comments
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  try {
    const totalViews = await Post.aggregate([{ $group: { _id: null, views: { $sum: "$views" } } }]);
    const engagementRate = 95; // Placeholder, calculate as needed
    const topPosts = await Post.find().sort({ views: -1 }).limit(5).select('title views');
    // Optionally, add more analytics as needed

    res.json({
      totalViews: totalViews[0]?.views || 0,
      engagementRate,
      topPosts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};