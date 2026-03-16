const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ email: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

