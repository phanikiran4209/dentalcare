const mongoose = require('mongoose');

const doctorBreakSchema = new mongoose.Schema(
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
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

doctorBreakSchema.index({ doctorId: 1, dayOfWeek: 1, date: 1, startTime: 1, endTime: 1 });

const DoctorBreak = mongoose.model('DoctorBreak', doctorBreakSchema);

module.exports = DoctorBreak;

