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
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User:', req.user);

    const { title, content, excerpt, category, published } = req.body;
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ 
        error: 'Title, content, excerpt, and category are required.',
        received: { title: !!title, content: !!content, excerpt: !!excerpt, category: !!category }
      });
    }
    
    // Parse tags if they exist
    let tags = [];
    if (req.body.tags) {
      try {
        // Handle both JSON string and regular string
        if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
          tags = JSON.parse(req.body.tags);
        } else if (typeof req.body.tags === 'string') {
          tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        } else if (Array.isArray(req.body.tags)) {
          tags = req.body.tags;
        }
      } catch (error) {
        console.error('Error parsing tags:', error);
        tags = [];
      }
    }

    // Handle image upload if file is present
    let imageUrl = '';
    if (req.files && req.files.image) {
      // You'll need to implement file upload logic here
      // For now, we'll skip image upload to test post creation
      console.log('Image file received:', req.files.image.name);
      // imageUrl = '/uploads/' + req.files.image.name; // Implement actual upload logic
    } else if (req.file) {
      // If using multer single file upload
      imageUrl = '/uploads/' + req.file.filename;
    }

    const slug = slugify(title);
    
    // Convert published to boolean
    const isPublished = published === 'true' || published === true;
    
    const post = new Post({
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt.trim(),
      imageUrl,
      tags,
      category: category.trim(),
      author: req.user._id,
      published: isPublished,
      publishedAt: isPublished ? new Date() : null
    });

    console.log('Creating post with data:', {
      title: post.title,
      slug: post.slug,
      category: post.category,
      tags: post.tags,
      published: post.published,
      author: post.author
    });

    await post.save();
    
    // Populate author data before sending response
    await post.populate('author', 'username email');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      error: 'Error creating post',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

exports.incrementView = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ views: post.views });
  } catch (error) {
    res.status(500).json({ error: 'Error incrementing view count' });
  }
};