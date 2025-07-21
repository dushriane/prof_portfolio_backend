const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Optionally, delete user's posts/comments as well
    await Post.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });
    res.json({ message: 'User and related content deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

exports.hidePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.hidden = true;
    await post.save();
    res.json({ message: 'Post hidden' });
  } catch (error) {
    res.status(500).json({ error: 'Error hiding post' });
  }
};

exports.hideComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.hidden = true;
    await comment.save();
    res.json({ message: 'Comment hidden' });
  } catch (error) {
    res.status(500).json({ error: 'Error hiding comment' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username bio profilePicture');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('author', 'username').populate('post', 'title slug');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};
