const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    content: { type: String, required: true },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    longDescription: { type: String, trim: true, maxlength: 20000 },
    summaryPoints: [{ type: String, trim: true, maxlength: 160 }],
    author: { type: String, default: 'Clinic Team' },
    // Preferred (new) category reference
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', index: true },
    // Backward-compatible string category (older clients)
    category: { type: String, index: true },
    tags: [{ type: String, index: true }],
    featuredImage: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

blogSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  category: 'text',
  shortDescription: 'text',
  longDescription: 'text',
  summaryPoints: 'text',
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

