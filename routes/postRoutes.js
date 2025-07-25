const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

// Posts
router.get('/', postController.getPosts);
router.get('/search', postController.searchPosts);
router.get('/:idOrSlug', postController.getPostByIdOrSlug);
router.post('/', auth, postController.createPost);
router.put('/:idOrSlug', auth, postController.updatePost);
router.delete('/:idOrSlug', auth, postController.deletePost);

// Drafts (create post with published: false)
router.post('/draft', auth, postController.createPost);

// Likes
router.post('/:postId/like', auth, userController.likePost);

// Comments
router.get('/:postId/comments', commentController.getCommentsForPost);
router.post('/:postId/comments', auth, commentController.addComment);
router.post('/:postId/comments/:parentId/reply', auth, commentController.replyToComment);
router.delete('/comments/:id', auth, commentController.deleteComment);
router.post('/comments/:id/like', auth, commentController.likeComment);
router.post('/comments/:id/hide', auth, commentController.hideComment);

module.exports = router;
