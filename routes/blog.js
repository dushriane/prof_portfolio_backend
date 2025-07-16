const express = require('express');
const BlogPost = require('../models/BlogPost');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1 })
      .select('title slug excerpt imageUrl tags category publishedAt views');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blog posts' });
  }
});

// Get a single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug,
      published: true 
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blog post' });
  }
});

// Create new blog post (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, tags, category } = req.body;
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const post = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      imageUrl,
      tags,
      category,
      published: false
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating blog post' });
  }
});

// Update blog post (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, tags, category, published } = req.body;
    
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update fields
    if (title) {
      post.title = title;
      post.slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (imageUrl) post.imageUrl = imageUrl;
    if (tags) post.tags = tags;
    if (category) post.category = category;
    if (published !== undefined) {
      post.published = published;
      if (published && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating blog post' });
  }
});

// Delete blog post (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting blog post' });
  }
});

// Get all posts for admin dashboard
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .select('title slug excerpt imageUrl tags category published publishedAt views createdAt');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blog posts' });
  }
});

module.exports = router; 