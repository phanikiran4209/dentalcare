const mongoose = require('mongoose');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorBreak = require('../models/DoctorBreak');
const BlockedSlot = require('../models/BlockedSlot');
const DoctorAvailabilityRange = require('../models/DoctorAvailabilityRange');
const SlotOverride = require('../models/SlotOverride');
const { generateSlotsForDate } = require('../services/slotService');
const Admin = require('../models/Admin');

function asObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

const validateTimesAgainstSlots = ({ slots, times, allowOverrideStatuses = [] }) => {
  const byTime = new Map(slots.map((s) => [s.time, s]));
  const validTimes = [];
  const invalid = [];

  for (const t of times) {
    const time = String(t || '').trim();
    const slot = byTime.get(time);
    if (!slot) {
      invalid.push({ time, reason: 'Slot not in availability' });
      continue;
    }

    // Only allow selecting "available" slots from the generated availability.
    // Optionally allow overriding existing break/blocked/leave entries.
    if (slot.status === 'available' || allowOverrideStatuses.includes(slot.status)) {
      validTimes.push(time);
      continue;
    }

    invalid.push({ time, reason: `Slot is ${slot.status}` });
  }

  return { validTimes, invalid };
};

const setWeeklyAvailability = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const payload = {
      doctorId,
      dayOfWeek: req.body.day_of_week,
      startDate: req.body.start_date,
      endDate: req.body.end_date,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      slotDuration: req.body.slot_duration,
    };

    const doc = await DoctorAvailabilityRange.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const addBreakTime = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const date = req.body.date;
    const times = Array.isArray(req.body.times) ? req.body.times : [];
    const label = req.body.label || 'break';
    const reason = req.body.reason || '';

    const { slots } = await generateSlotsForDate({ doctorId, date });
    const { validTimes, invalid } = validateTimesAgainstSlots({
      slots,
      times,
      allowOverrideStatuses: ['break'],
    });
    if (invalid.length) {
      return res.status(400).json({
        message: 'Some selected times are not valid for break',
        invalid,
      });
    }

    const ops = times.map((time) => ({
      updateOne: {
        filter: { doctorId, date, time },
        update: { $set: { doctorId, date, time, status: 'break', label, reason } },
        upsert: true,
      },
    }));

    if (validTimes.length === 0) return res.status(400).json({ message: 'times is required' });

    await SlotOverride.bulkWrite(
      validTimes.map((time) => ({
        updateOne: {
          filter: { doctorId, date, time },
          update: { $set: { doctorId, date, time, status: 'break', label, reason } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    const saved = await SlotOverride.find({ doctorId, date, time: { $in: validTimes } }).lean();

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

const blockSpecificSlot = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const date = req.body.date;
    const times = Array.isArray(req.body.times) ? req.body.times : [];
    const label = req.body.label || 'blocked';
    const reason = req.body.reason || '';

    const { slots } = await generateSlotsForDate({ doctorId, date });
    const { validTimes, invalid } = validateTimesAgainstSlots({
      slots,
      times,
      allowOverrideStatuses: ['blocked'],
    });
    if (invalid.length) {
      return res.status(400).json({
        message: 'Some selected times are not valid for block',
        invalid,
      });
    }

    const ops = times.map((time) => ({
      updateOne: {
        filter: { doctorId, date, time },
        update: { $set: { doctorId, date, time, status: 'blocked', label, reason } },
        upsert: true,
      },
    }));

    if (validTimes.length === 0) return res.status(400).json({ message: 'times is required' });

    await SlotOverride.bulkWrite(
      validTimes.map((time) => ({
        updateOne: {
          filter: { doctorId, date, time },
          update: { $set: { doctorId, date, time, status: 'blocked', label, reason } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    const saved = await SlotOverride.find({ doctorId, date, time: { $in: validTimes } }).lean();

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

const markLeave = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.body.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const date = req.body.date;
    const label = req.body.label || 'leave';
    const reason = req.body.reason || '';

    let times = Array.isArray(req.body.times) ? req.body.times : [];
    if (times.length === 0) {
      const result = await generateSlotsForDate({ doctorId, date });
      times = result.slots.filter((s) => s.status === 'available').map((s) => s.time);
    }

    if (times.length === 0) return res.status(400).json({ message: 'No available slots to mark as leave' });

    const { slots } = await generateSlotsForDate({ doctorId, date });
    const { validTimes, invalid } = validateTimesAgainstSlots({
      slots,
      times,
      allowOverrideStatuses: ['leave'],
    });
    if (invalid.length) {
      return res.status(400).json({
        message: 'Some selected times are not valid for leave',
        invalid,
      });
    }

    const ops = times.map((time) => ({
      updateOne: {
        filter: { doctorId, date, time },
        update: { $set: { doctorId, date, time, status: 'leave', label, reason } },
        upsert: true,
      },
    }));

    await SlotOverride.bulkWrite(
      validTimes.map((time) => ({
        updateOne: {
          filter: { doctorId, date, time },
          update: { $set: { doctorId, date, time, status: 'leave', label, reason } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    const saved = await SlotOverride.find({ doctorId, date, time: { $in: validTimes } }).lean();

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.query.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });

    const startDate = String(req.query.start_date || '').trim();
    const endDate = String(req.query.end_date || '').trim();

    const filter = { doctorId };
    if (startDate) filter.endDate = { $gte: startDate };
    if (endDate) filter.startDate = { ...(filter.startDate || {}), $lte: endDate };

    const items = await DoctorAvailabilityRange.find(filter).sort({ startDate: 1, dayOfWeek: 1 }).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getOverridesForDate = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.query.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });
    const date = String(req.query.date || '').trim();
    if (!date) return res.status(400).json({ message: 'date is required' });

    const overrides = await SlotOverride.find({ doctorId, date }).sort({ time: 1 }).lean();
    res.json(overrides);
  } catch (err) {
    next(err);
  }
};

// Admin helper: get slots for a selected date so UI can pick break/block times
const getAvailabilitySlotsForDateAdmin = async (req, res, next) => {
  try {
    const doctorId = asObjectId(req.query.doctor_id);
    if (!doctorId) return res.status(400).json({ message: 'Invalid doctor_id' });
    const date = String(req.query.date || '').trim();
    if (!date) return res.status(400).json({ message: 'date is required' });

    const result = await generateSlotsForDate({ doctorId, date });
    res.json({
      date,
      dayOfWeek: result.dayOfWeek,
      slots: result.slots,
    });
  } catch (err) {
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

// Public helper: get slots for a date without providing doctor_id.
// Uses PUBLIC_DOCTOR_ID if set; otherwise falls back to first Admin.
const getAvailableSlotsForDatePublic = async (req, res, next) => {
  try {
    const date = String(req.query.date || '').trim();
    if (!date) return res.status(400).json({ message: 'date is required' });

    let doctorId = null;

    const configured = String(process.env.PUBLIC_DOCTOR_ID || '').trim();
    if (configured) {
      doctorId = asObjectId(configured);
      if (!doctorId) return res.status(500).json({ message: 'Server misconfigured: invalid PUBLIC_DOCTOR_ID' });
    } else {
      const first = await Admin.findOne({}).select('_id').lean();
      if (!first) return res.status(404).json({ message: 'No doctor configured' });
      doctorId = new mongoose.Types.ObjectId(first._id);
    }

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
  getAvailableSlotsForDatePublic,
  markLeave,
  getAvailability,
  getOverridesForDate,
  getAvailabilitySlotsForDateAdmin,
};

