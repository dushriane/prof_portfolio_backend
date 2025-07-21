const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

// Profile
router.get('/me', auth, userController.getUserProfile);
router.put('/me', auth, userController.updateUserProfile);
router.get('/:id', userController.getUserProfile);

// Bookmarks
router.get('/me/bookmarks', auth, userController.getUserBookmarks);
router.post('/me/bookmarks/:postId', auth, userController.bookmarkPost);

// Likes
router.post('/me/likes/:postId', auth, userController.likePost);

// User's posts/comments
router.get('/me/posts', auth, userController.getUserPosts);
router.get('/me/comments', auth, userController.getUserComments);

module.exports = router;
