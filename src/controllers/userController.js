const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isVerified: true })
      .select('userId fullName mobileNumber email username isVerified adminAccessCode createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
};
