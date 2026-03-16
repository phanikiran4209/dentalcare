const Service = require('../models/Service');

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

const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(services);
  } catch (err) {
    next(err);
  }
};

const createService = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.points !== undefined) {
      payload.points = normalizePoints(payload.points) || [];
    }
    const service = await Service.create(payload);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.points !== undefined) {
      payload.points = normalizePoints(payload.points) || [];
    }
    const service = await Service.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    next(err);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};

