const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    // Get all comments for post, including replies, not hidden
    const comments = await Comment.find({ post: postId, hidden: { $ne: true } })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: 1 });
    // Thread comments
    const commentMap = {};
    comments.forEach(c => commentMap[c._id] = { ...c._doc, replies: [] });
    const roots = [];
    comments.forEach(c => {
      if (c.parent) {
        if (commentMap[c.parent]) commentMap[c.parent].replies.push(commentMap[c._id]);
      } else {
        roots.push(commentMap[c._id]);
      }
    });
    res.json(roots);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const alreadyLiked = comment.likes.includes(userId);
    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }
    await comment.save();
    res.json({ liked: !alreadyLiked, likesCount: comment.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Error liking comment' });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { postId, parentId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const parent = await Comment.findById(parentId);
    if (!parent) return res.status(404).json({ error: 'Parent comment not found' });
    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content,
      parent: parentId
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error replying to comment' });
  }
};

exports.hideComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to hide this comment' });
    }
    comment.hidden = true;
    await comment.save();
    res.json({ message: 'Comment hidden' });
  } catch (error) {
    res.status(500).json({ error: 'Error hiding comment' });
  }
};
