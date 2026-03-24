const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const headerSchema = new mongoose.Schema(
  {
    locationName: { type: String, trim: true },
    mapLink: { type: String },
    email: { type: String, trim: true, lowercase: true },
    timings: { type: String, trim: true },
    callNumber: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    socialLinks: [socialLinkSchema],
  },
  { timestamps: true }
);

const Header = mongoose.model('Header', headerSchema);

module.exports = Header;
