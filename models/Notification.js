const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'new_message', 'new_comment', etc.
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedEntity: { type: mongoose.Schema.Types.ObjectId }, // Links to post/comment/message
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);