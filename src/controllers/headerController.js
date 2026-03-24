const Header = require('../models/Header');

const getHeaders = async (req, res, next) => {
  try {
    const headers = await Header.find().lean();
    res.json(headers);
  } catch (err) {
    next(err);
  }
};

const createHeader = async (req, res, next) => {
  try {
    const header = await Header.create(req.body);
    res.status(201).json(header);
  } catch (err) {
    next(err);
  }
};

const updateHeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const header = await Header.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!header) {
      return res.status(404).json({ message: 'Header details not found' });
    }
    res.json(header);
  } catch (err) {
    next(err);
  }
};

const deleteHeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const header = await Header.findByIdAndDelete(id);
    if (!header) {
      return res.status(404).json({ message: 'Header details not found' });
    }
    res.json({ message: 'Header details deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHeaders,
  createHeader,
  updateHeader,
  deleteHeader,
};
