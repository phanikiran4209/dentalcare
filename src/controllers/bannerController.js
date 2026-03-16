const Banner = require('../models/Banner');

const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

const getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (err) {
    next(err);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
};

