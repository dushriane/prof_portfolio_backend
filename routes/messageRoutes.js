const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', messageController.saveMessage);
router.get('/', protect, messageController.getMessages);
router.put('/:id/read', protect, messageController.markAsRead);
router.delete('/:id', protect, messageController.deleteMessage);

module.exports = router;