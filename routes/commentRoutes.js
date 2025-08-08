const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth } = require('../middlewares/auth');

// ...other routes...
router.post('/posts/:postId/comments/:parentId/replies', auth, commentController.replyToComment);

module.exports = router;