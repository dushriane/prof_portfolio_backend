const Category = require('../models/Category');
const Post = require('../models/Post');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    // Optionally, count posts per category
    const categoriesWithCount = await Promise.all(categories.map(async cat => {
      const postCount = await Post.countDocuments({ category: cat.name });
      return { name: cat.name, postCount };
    }));
    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Category already exists' });
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category' });
  }
};