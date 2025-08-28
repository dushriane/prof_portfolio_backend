const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Posts
router.get('/', postController.getPosts);
router.get('/search', postController.searchPosts);
router.get('/:idOrSlug', postController.getPostByIdOrSlug);

router.post('/', auth, upload.single('image'), postController.createPost);
router.put('/:idOrSlug', auth, upload.single('image'), postController.updatePost);
router.delete('/:idOrSlug', auth, postController.deletePost);

// Drafts (create post with published: false)
router.post('/draft', auth, upload.single('image'), postController.createPost);

// Likes
router.post('/:postId/like', auth, userController.likePost);

// Comments
router.get('/:postId/comments', commentController.getCommentsForPost);
router.post('/:postId/comments', auth, commentController.addComment);
router.post('/:postId/comments/:parentId/reply', auth, commentController.replyToComment);
router.delete('/comments/:id', auth, commentController.deleteComment);
router.post('/comments/:id/like', auth, commentController.likeComment);
router.post('/comments/:id/hide', auth, commentController.hideComment);

router.post('/:postId/view', postController.incrementView);
// Add this route for tracking post views
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate('comments');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
});

module.exports = router;
