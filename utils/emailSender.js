const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const emailContent = {
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #7e4bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  return await sendEmail(emailContent);
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  const emailContent = {
    to: email,
    subject: 'Welcome to Our Blog Platform!',
    text: `Welcome ${username}! Thank you for joining our blog platform.`,
    html: `
      <h2>Welcome ${username}!</h2>
      <p>Thank you for joining our blog platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Read and comment on blog posts</li>
        <li>Like and bookmark your favorite posts</li>
        <li>Create your own posts (if you're a writer)</li>
      </ul>
      <p>Happy blogging!</p>
    `
  };

  return await sendEmail(emailContent);
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
