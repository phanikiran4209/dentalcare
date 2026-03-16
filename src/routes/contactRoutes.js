const express = require('express');
const {
  createContactMessage,
  getContactMessagesAdmin,
  replyToContactMessage,
  deleteContactMessage,
} = require('../controllers/contactController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { contactCreateSchema } = require('../validators/contactValidator');

const router = express.Router();

// Public
router.post('/', validate(contactCreateSchema), createContactMessage);

// Admin
router.get('/admin', auth, admin, getContactMessagesAdmin);
router.post('/admin/:id/reply', auth, admin, replyToContactMessage);
router.delete('/admin/:id', auth, admin, deleteContactMessage);

module.exports = router;

