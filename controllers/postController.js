const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to generate slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, tags, category, published } = req.body;
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ error: 'Title, content, excerpt, and category are required.' });
    }
    const slug = slugify(title);
    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      imageUrl: imageUrl || '',
      tags: tags || [],
      category,
      author: req.user._id,
      published: published || false,
      publishedAt: published ? new Date() : null
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, author, published } = req.query;
    const query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (published !== undefined) query.published = published === 'true';
    else query.published = true; // Only published by default
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username bio profilePicture');
    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
};

exports.getPostByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let post;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      post = await Post.findById(idOrSlug).populate('author', 'username bio profilePicture');
    }
    if (!post) {
      post = await Post.findOne({ slug: idOrSlug }).populate('author', 'username bio profilePicture');
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Increment view count
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let post = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? await Post.findById(idOrSlug)
      : await Post.findOne({ slug: idOrSlug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Only author or admin can update
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    const { title, content, excerpt, imageUrl, tags, category, published } = req.body;
    if (title) {
      post.title = title;
      post.slug = slugify(title);
    }
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (imageUrl) post.imageUrl = imageUrl;
    if (tags) post.tags = tags;
    if (category) post.category = category;
    if (published !== undefined) {
      post.published = published;
      post.publishedAt = published ? new Date() : null;
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let post = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? await Post.findById(idOrSlug)
      : await Post.findOne({ slug: idOrSlug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Only author or admin can delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required.' });
    }
    const regex = new RegExp(q, 'i');
    const query = {
      published: true,
      $or: [
        { title: regex },
        { content: regex },
        { excerpt: regex },
        { tags: regex },
        { category: regex }
      ]
    };
    const posts = await Post.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'username bio profilePicture');
    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Error searching posts' });
  }
};
