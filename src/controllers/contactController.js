const Contact = require('../models/Contact');
const { sendContactNotification, sendEmail } = require('../services/emailService');

const createContactMessage = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    // Fire and forget email notifications
    sendContactNotification(contact).catch(() => {});

    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
};

const getContactMessagesAdmin = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

const replyToContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, reply } = req.body;

    const message = await Contact.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.email) {
      return res.status(400).json({ message: 'No email associated with this message' });
    }

    await sendEmail({
      to: message.email,
      subject: subject || 'Response from dental clinic',
      html: reply,
    });

    message.replied = true;
    await message.save();

    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Contact.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createContactMessage,
  getContactMessagesAdmin,
  replyToContactMessage,
  deleteContactMessage,
};

