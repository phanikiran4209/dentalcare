const express = require('express');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  subscribeEmail,
  listSubscriptionsAdmin,
  sendBulkEmailAdmin,
} = require('../controllers/subscriptionController');
const {
  subscribeSchema,
  sendBulkEmailSchema,
} = require('../validators/subscriptionValidator');

const router = express.Router();

// Public (website "Stay Updated" form)
router.post('/', validate(subscribeSchema), subscribeEmail);

// Admin
router.get('/admin', auth, admin, listSubscriptionsAdmin);
router.post('/admin/send', auth, admin, validate(sendBulkEmailSchema), sendBulkEmailAdmin);

module.exports = router;

