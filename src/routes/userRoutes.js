const express = require('express');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

// Public
router.get('/', getUsers);

module.exports = router;
