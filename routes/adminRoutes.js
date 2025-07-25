const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middlewares/auth');

// Users
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Posts
router.get('/posts', adminAuth, adminController.getAllPosts);
router.post('/posts/:id/hide', adminAuth, adminController.hidePost);

// Comments
router.get('/comments', adminAuth, adminController.getAllComments);
router.post('/comments/:id/hide', adminAuth, adminController.hideComment);

// Dashboard Stats
router.get('/dashboard/stats', adminAuth, userController.getDashboardStats);

module.exports = router;
