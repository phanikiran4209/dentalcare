const SiteSettings = require('../models/SiteSettings');

const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne().sort({ createdAt: -1 }).lean();
    res.json(settings || {});
  } catch (err) {
    next(err);
  }
};

const upsertSettings = async (req, res, next) => {
  try {
    const payload = req.body;
    const existing = await SiteSettings.findOne().sort({ createdAt: -1 });

    let settings;
    if (existing) {
      existing.set(payload);
      settings = await existing.save();
    } else {
      settings = await SiteSettings.create(payload);
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicSettings,
  upsertSettings,
};

