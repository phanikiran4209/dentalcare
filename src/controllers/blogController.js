const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');

const normalizePoints = (value) => {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
};

const getBlogs = async (req, res, next) => {
  try {
    // For dashboard use: return all blogs, newest first, no filters/pagination required.
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    res.json(blogs);
  } catch (err) {
    next(err);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, published: true }).lean();
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

// Admin controllers

const createBlog = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.summaryPoints !== undefined) {
      payload.summaryPoints = normalizePoints(payload.summaryPoints) || [];
    }

    if (!payload.categoryId && payload.categorySlug) {
      const cat = await BlogCategory.findOne({ slug: String(payload.categorySlug).toLowerCase() }).lean();
      if (!cat) return res.status(400).json({ message: 'Invalid categorySlug' });
      payload.categoryId = cat._id;
    }

    delete payload.categorySlug;

    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug must be unique' });
    }
    next(err);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.summaryPoints !== undefined) {
      payload.summaryPoints = normalizePoints(payload.summaryPoints) || [];
    }

    if (!payload.categoryId && payload.categorySlug) {
      const cat = await BlogCategory.findOne({ slug: String(payload.categorySlug).toLowerCase() }).lean();
      if (!cat) return res.status(400).json({ message: 'Invalid categorySlug' });
      payload.categoryId = cat._id;
    }

    delete payload.categorySlug;

    const blog = await Blog.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    next(err);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
};

