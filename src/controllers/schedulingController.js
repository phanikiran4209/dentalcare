const mongoose = require('mongoose');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorBreak = require('../models/DoctorBreak');
const BlockedSlot = require('../models/BlockedSlot');
const { generateSlotsForDate } = require('../services/slotService');

function asObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

const setWeeklyAvailability = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const payload = {
      doctorId,
      date: req.body.date || null,
      dayOfWeek: req.body.day_of_week,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      slotDuration: req.body.slot_duration,
    };

    const doc = await DoctorAvailability.findOneAndUpdate(
      { doctorId, dayOfWeek: payload.dayOfWeek },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const addBreakTime = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const doc = await DoctorBreak.create({
      doctorId,
      date: req.body.date || null,
      dayOfWeek: req.body.day_of_week,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      reason: req.body.reason || '',
    });

    res.status(201).json(doc);
  } catch (err) {
    // duplicate unique index => treat as conflict
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Break already exists for same time range' });
    }
    next(err);
  }
};

const blockSpecificSlot = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const doc = await BlockedSlot.create({
      doctorId,
      date: req.body.date,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      reason: req.body.reason || '',
    });

    res.status(201).json(doc);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Blocked slot already exists for same time range' });
    }
    next(err);
  }
};

const getAvailableSlotsForDate = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.query.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });
    const date = String(req.query.date || '');
    if (!date) return res.status(400).json({ message: 'date is required' });

    const result = await generateSlotsForDate({ doctorId, date });
    res.json(result.slots);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  setWeeklyAvailability,
  addBreakTime,
  blockSpecificSlot,
  getAvailableSlotsForDate,
};

