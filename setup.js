const mongoose = require('mongoose');
const User = require('./models/User');
const BlogPost = require('./models/BlogPost');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create admin user
    const existingAdmin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    if (!existingAdmin) {
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample blog posts
    const samplePosts = [
      {
        title: 'Building Systems That Last',
        slug: 'building-systems-that-last',
        content: 'Why reliability isn\'t just optional-it\'s essential. A deep dive into creating software that stands the test of time.',
        excerpt: 'Why reliability isn\'t just optional-it\'s essential. A deep dive into creating software that stands the test of time.',
        imageUrl: './images/blogone.jpeg',
        tags: ['Engineering', 'Philosophy', 'Systems'],
        category: 'Engineering',
        published: true,
        publishedAt: new Date('2025-01-15'),
        views: 150
      },
      {
        title: 'Emotions feel good.',
        slug: 'emotions-feel-good',
        content: 'We were made to feel. What makes things resonate.',
        excerpt: 'We were made to feel. What makes things resonate.',
        imageUrl: './images/blogtwo.jpg',
        tags: ['Philosophy', 'Emotion'],
        category: 'Philosophy',
        published: true,
        publishedAt: new Date('2025-01-15'),
        views: 120
      },
      {
        title: 'Design is 50% of the battle.',
        slug: 'design-is-50-percent-of-the-battle',
        content: 'It may look good but does it work? It may work but does it look good? Design is 50% of the battle.',
        excerpt: 'It may look good but does it work? It may work but does it look good? Design is 50% of the battle.',
        imageUrl: './images/blogthree.jpg',
        tags: ['Philosophy', 'Emotion', 'Design'],
        category: 'Design',
        published: true,
        publishedAt: new Date('2025-01-15'),
        views: 95
      },
      {
        title: 'Not so open, open source.',
        slug: 'not-so-open-open-source',
        content: 'Modern day open sourced is not what it used to be. Open sourced is bad.',
        excerpt: 'Modern day open sourced is not what it used to be. Open sourced is bad.',
        imageUrl: './images/blogfour.jpg',
        tags: ['Philosophy', 'Software', 'Community'],
        category: 'Software',
        published: true,
        publishedAt: new Date('2025-06-26'),
        views: 80
      },
      {
        title: 'Objective truth',
        slug: 'objective-truth',
        content: 'You are both objectively right and wrong at the same time.',
        excerpt: 'You are both objectively right and wrong at the same time.',
        imageUrl: './images/blogfive.jpeg',
        tags: ['Philosophy'],
        category: 'Philosophy',
        published: true,
        publishedAt: new Date('2025-06-29'),
        views: 65
      }
    ];

    for (const postData of samplePosts) {
      const existingPost = await BlogPost.findOne({ slug: postData.slug });
      if (!existingPost) {
        const post = new BlogPost(postData);
        await post.save();
        console.log(`Created blog post: ${postData.title}`);
      } else {
        console.log(`Blog post already exists: ${postData.title}`);
      }
    }

    console.log('Database setup completed successfully!');
    console.log('\nLogin credentials:');
    console.log(`Username: ${process.env.ADMIN_USERNAME}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('\nYou can now start the server with: npm start');

  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupDatabase(); 