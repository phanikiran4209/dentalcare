const Appointment = require('../models/Appointment');
const {
  sendAppointmentNotification,
  sendAppointmentStatusChangeNotification,
} = require('../services/emailService');
const mongoose = require('mongoose');
const { assertSlotBookable } = require('../services/slotService');

const createAppointment = async (req, res, next) => {
  try {
    const { date, time, doctor_id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
      return res.status(400).json({ message: 'Invalid doctor_id' });
    }

    const doctorId = new mongoose.Types.ObjectId(doctor_id);

    const bookable = await assertSlotBookable({ doctorId, date, time });
    if (!bookable.ok) {
      return res.status(400).json({ message: 'Selected time slot is not available', reason: bookable.reason });
    }

    const appointment = await Appointment.create({
      ...req.body,
      doctorId,
    });

    // Fire and forget email notifications (owner + patient)
    sendAppointmentNotification(appointment).catch(() => {});

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

const getAppointmentsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, date, time } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const before = appointment.toObject();

    // If admin is changing schedule (date/time), ensure the new slot is bookable.
    if ((date && date !== appointment.date) || (time && time !== appointment.time)) {
      const nextDate = date || appointment.date;
      const nextTime = time || appointment.time;
      const bookable = await assertSlotBookable({ doctorId: appointment.doctorId, date: nextDate, time: nextTime });
      if (!bookable.ok) {
        return res.status(400).json({
          message: 'Selected time slot is not available',
          reason: bookable.reason,
        });
      }
    }

    if (status) {
      appointment.status = status;
    }
    if (date) {
      appointment.date = date;
    }
    if (time) {
      appointment.time = time;
    }

    await appointment.save();

    // Notify patient about any status / date / time change (fire and forget)
    sendAppointmentStatusChangeNotification(before, appointment.toObject()).catch(() => {});

    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAppointment,
  getAppointmentsAdmin,
  updateAppointmentStatus,
  deleteAppointment,
};

