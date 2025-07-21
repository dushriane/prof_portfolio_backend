const User = require('./models/User');
const Post = require('./models/Post');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'ivyharu5@gmail.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const admin = new User({
      username: 'admin',
      email: 'ivyharu5@gmail.com',
      password: 'arn123',
      role: 'admin',
      bio: 'System Administrator'
    });
    
    await admin.save();
    console.log('Admin created successfully');
    console.log('Email: ivyharu5@gmail.com');
    console.log('Password: arn123');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
  } else {
    console.log('Uploads directory already exists');
  }
};

const createSampleData = async () => {
  try {
    // Create sample user
    const sampleUser = await User.findOne({ email: 'ivyharu5@gmail.com' });
    if (!sampleUser) {
      const user = new User({
        username: 'sampleuser',
        email: 'ivyharu5@gmail.com',
        password: 'arn123',
        role: 'user',
        bio: 'Sample user for testing'
      });
      await user.save();
      console.log('Sample user created');
    }

    // Create sample posts (if you want)
    const admin = await User.findOne({ email: 'ivyharu5@gmail.com' });
    if (admin) {
      const existingPost = await Post.findOne({ title: 'Welcome to My Blog' });
      if (!existingPost) {
        const post = new Post({
          title: 'Welcome to My Blog',
          slug: 'welcome-to-my-blog',
          content: 'This is a sample blog post to get you started.',
          excerpt: 'A brief introduction to the blog.',
          category: 'General',
          author: admin._id,
          published: true,
          publishedAt: new Date(),
          tags: ['welcome', 'introduction']
        });
        await post.save();
        console.log('Sample post created');
      }
    }
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

const main = async () => {
  try {
    console.log('Starting setup...');
    
    // Connect to database
    await connectDB();
    
    // Create uploads directory
    createUploadsDirectory();
    
    // Create admin
    await createAdmin();
    
    // Create sample data
    await createSampleData();
    
    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

main(); 