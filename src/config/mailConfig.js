const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { logger } = require('../utils/logger');

dotenv.config();

let transporter;
let verifiedOnce = false;

const normalizeSmtpPass = (pass, host, service) => {
  const raw = String(pass || '');
  const h = String(host || '').toLowerCase();
  const s = String(service || '').toLowerCase();

  // Gmail app-passwords are often shown with spaces (xxxx xxxx xxxx xxxx)
  // Nodemailer expects the actual value without spaces.
  const looksLikeGmail = s === 'gmail' || h.includes('gmail');
  if (looksLikeGmail && /\s/.test(raw)) {
    const compact = raw.replace(/\s+/g, '');
    // Only apply when it still looks like an app password length.
    if (compact.length >= 16) {
      logger.warn('Normalizing SMTP_PASS by removing spaces for Gmail');
      return compact;
    }
  }

  return raw;
};

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP configuration is missing in environment variables');
  }

  const host = String(process.env.SMTP_HOST || '').trim();
  const pass = normalizeSmtpPass(process.env.SMTP_PASS, host, process.env.SMTP_SERVICE);

  // Works for Gmail app passwords when SMTP_HOST is set to smtp.gmail.com
  // (or when SMTP_SERVICE=gmail is used).
  const transportOptions =
    process.env.SMTP_SERVICE && String(process.env.SMTP_SERVICE).toLowerCase() === 'gmail'
      ? {
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass },
        }
      : {
          host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass },
        };

  transporter = nodemailer.createTransport({
    ...transportOptions,
    // Fail fast on SMTP issues to keep APIs responsive.
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 5000,
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 5000,
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 10000,
  });

  return transporter;
};

const verifyTransporter = async () => {
  if (verifiedOnce) return;

  const t = getTransporter();
  await t.verify();
  verifiedOnce = true;
};

module.exports = { getTransporter, verifyTransporter };

