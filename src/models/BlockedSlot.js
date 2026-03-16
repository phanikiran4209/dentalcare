const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

blockedSlotSchema.index({ doctorId: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema);

module.exports = BlockedSlot;

