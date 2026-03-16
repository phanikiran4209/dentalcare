const BlogCategory = require('../models/BlogCategory');

const createCategory = async (req, res, next) => {
  try {
    const category = await BlogCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'Category name/slug must be unique' });
    }
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await BlogCategory.find()
      .sort({ order: 1, name: 1, createdAt: -1 })
      .lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'Category name/slug must be unique' });
    }
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await BlogCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};

