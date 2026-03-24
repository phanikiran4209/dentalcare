const mongoose = require('mongoose');

// Per-slot override for a specific date+time.
// Used for breaks (food/coffee), blocked slots, and leave.
const slotOverrideSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm (slot start time)
    status: { type: String, enum: ['break', 'blocked', 'leave'], required: true, index: true },
    label: { type: String, default: '' }, // e.g. food, coffee, leave
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

slotOverrideSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

const SlotOverride = mongoose.model('SlotOverride', slotOverrideSchema);

module.exports = SlotOverride;

