const { getTransporter, verifyTransporter } = require('../config/mailConfig');
const { logger } = require('../utils/logger');

const sendEmail = async ({ to, subject, html, from, cc, bcc, text }) => {
  if (process.env.NODE_ENV === 'test') {
    return { messageId: 'test', accepted: [to], rejected: [] };
  }

  try {
    await verifyTransporter();
  } catch (err) {
    logger.error('SMTP verify failed', { error: err });
    throw err;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: from || process.env.MAIL_FROM,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err });
    throw err;
  }
};

const renderAppointmentDetails = (appointment) => {
  return `
    <ul>
      <li><strong>Service:</strong> ${appointment.service}</li>
      <li><strong>Date:</strong> ${appointment.date}</li>
      <li><strong>Time:</strong> ${appointment.time}</li>
      <li><strong>Status:</strong> ${appointment.status || 'pending'}</li>
    </ul>
  `;
};

const sendAppointmentNotification = async (appointment) => {
  const ownerEmail = process.env.CLINIC_OWNER_EMAIL;

  // Notify clinic owner (if configured)
  if (ownerEmail) {
    const subject = `New appointment request from ${appointment.name}`;
    const html = `
      <h2>New Appointment Request</h2>
      <p><strong>Name:</strong> ${appointment.name}</p>
      <p><strong>Email:</strong> ${appointment.email}</p>
      <p><strong>Phone:</strong> ${appointment.phone}</p>
      <p><strong>Service:</strong> ${appointment.service}</p>
      <p><strong>Date:</strong> ${appointment.date}</p>
      <p><strong>Time:</strong> ${appointment.time}</p>
      <p><strong>Message:</strong> ${appointment.message || 'N/A'}</p>
    `;

    await sendEmail({ to: ownerEmail, subject, html });
  }

  // Confirmation to patient
  if (appointment.email) {
    const subject = 'Your appointment request has been received';
    const html = `
      <p>Dear ${appointment.name},</p>
      <p>Thank you for booking an appointment with our clinic. Here are your appointment details:</p>
      ${renderAppointmentDetails(appointment)}
      <p>We will notify you if the appointment is approved, rescheduled, or rejected.</p>
    `;

    await sendEmail({
      to: appointment.email,
      subject,
      html,
    });
  }
};

const sendAppointmentStatusChangeNotification = async (before, after) => {
  if (!after || !after.email) return;

  const statusChanged = before.status !== after.status;
  const dateChanged = before.date !== after.date;
  const timeChanged = before.time !== after.time;
  const scheduleChanged = dateChanged || timeChanged;

  let subject = 'Your appointment has been updated';
  let introLine = 'Your appointment details have been updated.';
  let statusLine = '';
  let scheduleLine = '';

  if (statusChanged) {
    if (after.status === 'approved') {
      subject = 'Your appointment has been approved';
      statusLine = 'Your appointment has been approved by the clinic team.';
    } else if (after.status === 'rejected') {
      subject = 'Your appointment has been rejected';
      statusLine =
        'We are sorry, but your appointment has been rejected. Please contact the clinic if you need more information.';
    } else if (after.status === 'pending') {
      subject = 'Your appointment is pending';
      statusLine = 'Your appointment request is still pending review by the clinic team.';
    }
  }

  if (scheduleChanged) {
    scheduleLine =
      'If the new appointment date or time does not work for you, please contact the clinic to reschedule.';
  }

  const lines = [
    introLine,
    statusLine,
    scheduleLine,
  ].filter(Boolean);

  const html = `
    <p>Dear ${after.name},</p>
    <p>${lines.join(' ')}</p>
    ${renderAppointmentDetails(after)}
  `;

  await sendEmail({
    to: after.email,
    subject,
    html,
  });
};

const sendContactNotification = async (contact) => {
  const ownerEmail = process.env.CLINIC_OWNER_EMAIL;
  if (!ownerEmail) return;

  const subject = `New contact message from ${contact.name}`;
  const html = `
    <h2>New Contact Message</h2>
    <p><strong>Name:</strong> ${contact.name}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Phone:</strong> ${contact.phone}</p>
    <p><strong>Message:</strong> ${contact.message}</p>
  `;

  await sendEmail({ to: ownerEmail, subject, html });

  if (contact.email) {
    await sendEmail({
      to: contact.email,
      subject: 'Thank you for contacting our clinic',
      html: `<p>Dear ${contact.name},</p>
             <p>Thank you for reaching out to our dental clinic. We have received your message and will get back to you as soon as possible.</p>
             <p>Best regards,<br/>Dental Clinic</p>`,
    });
  }
};

const sendTestimonialThankYou = async (testimonial) => {
  if (!testimonial || !testimonial.email) return;

  const subject = 'Thank you for your testimonial';
  const html = `
    <p>Dear ${testimonial.name},</p>
    <p>Thank you very much for sharing your feedback about our clinic. We truly appreciate you taking the time to leave a testimonial.</p>
    <p>Your review helps other patients learn more about our services and encourages our team to keep doing our best every day.</p>
    <p>Best regards,<br/>Dental Clinic</p>
  `;

  await sendEmail({
    to: testimonial.email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendAppointmentNotification,
  sendAppointmentStatusChangeNotification,
  sendContactNotification,
  sendTestimonialThankYou,
};

