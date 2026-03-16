const mongoose = require('mongoose');

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    date: { type: String, index: true }, // optional specific date (YYYY-MM-DD)
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

doctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1, date: 1 });

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);

module.exports = DoctorAvailability;

