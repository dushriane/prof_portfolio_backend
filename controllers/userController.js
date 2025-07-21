const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, profilePicture } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const user = await User.findById(userId);
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
      user.likedPosts.pull(postId);
    } else {
      post.likes.push(userId);
      user.likedPosts.push(postId);
    }
    await post.save();
    await user.save();
    res.json({ liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Error liking post' });
  }
};

exports.bookmarkPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const alreadyBookmarked = user.bookmarks.includes(postId);
    if (alreadyBookmarked) {
      user.bookmarks.pull(postId);
    } else {
      user.bookmarks.push(postId);
    }
    await user.save();
    res.json({ bookmarked: !alreadyBookmarked, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ error: 'Error bookmarking post' });
  }
};

exports.getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'username bio profilePicture' }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookmarks' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user posts' });
  }
};

exports.getUserComments = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const comments = await Comment.find({ author: userId }).sort({ createdAt: -1 }).populate('post', 'title slug');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user comments' });
  }
};
