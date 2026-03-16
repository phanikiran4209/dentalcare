const Faq = require('../models/Faq');

const getPublicFaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find({ status: true }).sort({ createdAt: 1 }).lean();
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

const getAdminFaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: 1 }).lean();
    res.json(faqs);
  } catch (err) {
    next(err);
  }
};

const createFaq = async (req, res, next) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json(faq);
  } catch (err) {
    next(err);
  }
};

const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (err) {
    next(err);
  }
};

const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};

