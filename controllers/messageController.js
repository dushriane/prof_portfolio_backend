const { body } = require('express-validator');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

//message validation
    exports.validateMessage = [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Invalid email address'),
      body('subject').notEmpty().withMessage('Subject is required'),
      body('message').notEmpty().withMessage('Message is required')
    ];

exports.saveMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Save to database
    const newMessage = await Message.create({ name, email, subject, message });
    
    // Send email notification
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New message: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Create admin notification
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        user: admin._id,
        type: 'new_message',
        content: `New message from ${name}`,
        relatedEntity: newMessage._id
      });
    }
    const { body } = require('express-validator');

    res.status(200).json({ 
      success: true, 
      message: 'Message saved successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to save message' 
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments();

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update message'
    });
  }
};