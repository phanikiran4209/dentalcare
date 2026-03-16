const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    backgroundImage: String,
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    keywords: [String],
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    clinicName: String,
    tagline: String,
    contactEmail: String,
    contactPhone: String,
    address: String,
    mapEmbedUrl: String,
    hero: heroSchema,
    about: {
      heading: String,
      content: String,
      dentistName: String,
      dentistQualifications: String,
    },
    seo: {
      home: seoSchema,
      services: seoSchema,
      blogs: seoSchema,
      contact: seoSchema,
      appointment: seoSchema,
    },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;

