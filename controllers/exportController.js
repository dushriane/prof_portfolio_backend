const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.exportData = async (req, res) => {
  try {
    const { format, includePosts, includeComments, includeAnalytics } = req.body;
    let data = {};

    if (includePosts) {
      data.posts = await Post.find();
    }
    if (includeComments) {
      data.comments = await Comment.find();
    }
    if (includeAnalytics) {
      // Example: total posts/views
      const totalViews = await Post.aggregate([{ $group: { _id: null, views: { $sum: "$views" } } }]);
      data.analytics = { totalViews: totalViews[0]?.views || 0 };
    }

    let output, mime, ext;
    if (format === 'csv') {
      // Simple CSV export for posts only (expand as needed)
      const posts = data.posts || [];
      const csv = [
        'Title,Category,Published,Views',
        ...posts.map(p => `"${p.title}","${p.category}",${p.published},${p.views}`)
      ].join('\n');
      output = csv;
      mime = 'text/csv';
      ext = 'csv';
    } else if (format === 'xml') {
      // Simple XML export for posts only (expand as needed)
      const posts = data.posts || [];
      output = `<posts>${posts.map(p => `<post><title>${p.title}</title><category>${p.category}</category></post>`).join('')}</posts>`;
      mime = 'application/xml';
      ext = 'xml';
    } else {
      // Default to JSON
      output = JSON.stringify(data, null, 2);
      mime = 'application/json';
      ext = 'json';
    }

    res.setHeader('Content-Disposition', `attachment; filename=blog_export.${ext}`);
    res.setHeader('Content-Type', mime);
    res.send(output);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data' });
  }
};