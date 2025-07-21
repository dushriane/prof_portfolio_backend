const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
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
      return existingAdmin;
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
    return admin;
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

const createSampleUsers = async () => {
  try {
    const users = [
      {
        username: 'writer1',
        email: 'writer1@example.com',
        password: 'password123',
        role: 'writer',
        bio: 'Professional writer and blogger'
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
        role: 'user',
        bio: 'Regular user who loves reading blogs'
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`User ${userData.username} created`);
      }
    }
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
};

const createSamplePosts = async (admin) => {
  try {
    const posts = [
      {
        title: 'Getting Started with Web Development',
        slug: 'getting-started-with-web-development',
        content: 'Web development is an exciting journey that combines creativity with technical skills...',
        excerpt: 'Learn the basics of web development and start your coding journey.',
        category: 'Technology',
        author: admin._id,
        published: true,
        publishedAt: new Date(),
        tags: ['web-development', 'beginners', 'coding']
      },
      {
        title: 'The Art of Writing Clean Code',
        slug: 'the-art-of-writing-clean-code',
        content: 'Clean code is not just about making it work, it\'s about making it readable and maintainable...',
        excerpt: 'Discover the principles of writing clean, maintainable code.',
        category: 'Programming',
        author: admin._id,
        published: true,
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        tags: ['clean-code', 'programming', 'best-practices']
      },
      {
        title: 'Understanding JavaScript Promises',
        slug: 'understanding-javascript-promises',
        content: 'Promises are a fundamental concept in modern JavaScript that help handle asynchronous operations...',
        excerpt: 'A comprehensive guide to JavaScript Promises and async/await.',
        category: 'JavaScript',
        author: admin._id,
        published: true,
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        tags: ['javascript', 'promises', 'async-await']
      }
    ];

    for (const postData of posts) {
      const existingPost = await Post.findOne({ slug: postData.slug });
      if (!existingPost) {
        const post = new Post(postData);
        await post.save();
        console.log(`Post "${postData.title}" created`);
      }
    }
  } catch (error) {
    console.error('Error creating sample posts:', error);
  }
};

const createSampleComments = async () => {
  try {
    const posts = await Post.find().limit(2);
    const users = await User.find({ role: 'user' }).limit(1);
    
    if (posts.length > 0 && users.length > 0) {
      const comments = [
        {
          post: posts[0]._id,
          author: users[0]._id,
          content: 'Great article! Very helpful for beginners.'
        },
        {
          post: posts[0]._id,
          author: users[0]._id,
          content: 'I learned a lot from this post. Thanks for sharing!'
        }
      ];

      for (const commentData of comments) {
        const comment = new Comment(commentData);
        await comment.save();
        console.log('Sample comment created');
      }
    }
  } catch (error) {
    console.error('Error creating sample comments:', error);
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

const main = async () => {
  try {
    console.log('Starting setup...');
    
    // Connect to database
    await connectDB();
    
    // Create uploads directory
    createUploadsDirectory();
    
    // Create admin
    const admin = await createAdmin();
    
    // Create sample data
    await createSampleUsers();
    await createSamplePosts(admin);
    await createSampleComments();
    
    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

main(); 