const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorBreak = require('../models/DoctorBreak');
const BlockedSlot = require('../models/BlockedSlot');
const DoctorAvailabilityRange = require('../models/DoctorAvailabilityRange');
const SlotOverride = require('../models/SlotOverride');

function parseTimeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map((x) => Number(x));
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  // [start, end) overlap
  return aStart < bEnd && bStart < aEnd;
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  // Use UTC day to avoid timezone surprises with date-only strings
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
}

async function generateSlotsForDate({ doctorId, date }) {
  const dayOfWeek = getDayOfWeek(date);
  if (!dayOfWeek) {
    return { dayOfWeek: null, slots: [] };
  }

  // Prefer date-specific availability; fall back to weekly (dayOfWeek only)
  const availability =
    (await DoctorAvailability.findOne({ doctorId, date }).lean()) ||
    (await DoctorAvailabilityRange.findOne({
      doctorId,
      dayOfWeek,
      startDate: { $lte: date },
      endDate: { $gte: date },
    })
      .sort({ startDate: -1 })
      .lean()) ||
    (await DoctorAvailability.findOne({
      doctorId,
      dayOfWeek,
      $or: [{ date: null }, { date: { $exists: false } }],
    }).lean());
  if (!availability) {
    return { dayOfWeek, slots: [] };
  }

  const startMin = parseTimeToMinutes(availability.startTime);
  const endMin = parseTimeToMinutes(availability.endTime);
  const duration = Number(availability.slotDuration);

  if (startMin === null || endMin === null || !duration || endMin <= startMin) {
    return { dayOfWeek, slots: [] };
  }

  const [breaks, blocks, booked, overrides] = await Promise.all([
    DoctorBreak.find({
      doctorId,
      $or: [{ dayOfWeek }, { date }],
    }).lean(),
    BlockedSlot.find({ doctorId, date }).lean(),
    Appointment.find({
      doctorId,
      date,
      status: { $in: ['pending', 'approved'] },
    })
      .select('time')
      .lean(),
    SlotOverride.find({ doctorId, date }).lean(),
  ]);

  const bookedTimes = new Set(booked.map((b) => b.time));
  const overrideByTime = new Map(overrides.map((o) => [o.time, o]));
  const breaksRanges = breaks
    .map((b) => ({
      start: parseTimeToMinutes(b.startTime),
      end: parseTimeToMinutes(b.endTime),
      reason: b.reason || 'Break',
    }))
    .filter((r) => r.start !== null && r.end !== null && r.end > r.start);

  const blockRanges = blocks
    .map((b) => ({
      start: parseTimeToMinutes(b.startTime),
      end: parseTimeToMinutes(b.endTime),
      reason: b.reason || 'Blocked',
    }))
    .filter((r) => r.start !== null && r.end !== null && r.end > r.start);

  const slots = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    const time = minutesToTime(t);
    const slotStart = t;
    const slotEnd = t + duration;

    const override = overrideByTime.get(time);
    if (override) {
      slots.push({
        time,
        status: override.status,
        reason: override.reason || override.label || override.status,
      });
      continue;
    }

    const breakHit = breaksRanges.find((r) => overlaps(slotStart, slotEnd, r.start, r.end));
    if (breakHit) {
      slots.push({ time, status: 'break', reason: breakHit.reason });
      continue;
    }

    const blockHit = blockRanges.find((r) => overlaps(slotStart, slotEnd, r.start, r.end));
    if (blockHit) {
      slots.push({ time, status: 'blocked', reason: blockHit.reason });
      continue;
    }

    if (bookedTimes.has(time)) {
      slots.push({ time, status: 'booked' });
      continue;
    }

    slots.push({ time, status: 'available' });
  }

  return { dayOfWeek, slots };
}

async function assertSlotBookable({ doctorId, date, time }) {
  const { slots } = await generateSlotsForDate({ doctorId, date });
  const slot = slots.find((s) => s.time === time);
  if (!slot) {
    return { ok: false, reason: 'Slot not in availability' };
  }
  if (slot.status !== 'available') {
    return { ok: false, reason: `Slot is ${slot.status}` };
  }
  return { ok: true };
}

module.exports = {
  generateSlotsForDate,
  assertSlotBookable,
};

