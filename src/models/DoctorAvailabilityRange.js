const mongoose = require('mongoose');

// Availability for a date range (inclusive), repeated by dayOfWeek.
// Example: 2026-03-01..2026-03-31, Monday, 10:00-18:00, 30 mins.
const doctorAvailabilityRangeSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    startDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    endDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      index: true,
    },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    slotDuration: { type: Number, required: true, min: 5, max: 240 }, // minutes
  },
  { timestamps: true }
);

doctorAvailabilityRangeSchema.index({ doctorId: 1, dayOfWeek: 1, startDate: 1, endDate: 1 });

const DoctorAvailabilityRange = mongoose.model(
  'DoctorAvailabilityRange',
  doctorAvailabilityRangeSchema
);

module.exports = DoctorAvailabilityRange;

