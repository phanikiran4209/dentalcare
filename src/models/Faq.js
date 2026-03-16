const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    faqId: { type: String, unique: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    faqType: {
      type: String,
      required: true,
      enum: ['COACHING', 'CONTACT', 'GENERAL'],
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

faqSchema.pre('save', async function generateFaqId(next) {
  if (this.faqId) {
    return next();
  }

  try {
    const lastFaq = await this.constructor
      .findOne()
      .sort({ createdAt: -1 })
      .select('faqId')
      .lean();

    let nextNumber = 1;
    if (lastFaq && lastFaq.faqId && /^FAQ\d+$/.test(lastFaq.faqId)) {
      nextNumber = parseInt(lastFaq.faqId.slice(3), 10) + 1;
    }

    this.faqId = `FAQ${String(nextNumber).padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Faq = mongoose.model('Faq', faqSchema);

module.exports = Faq;

