const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter;
let verifiedOnce = false;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP configuration is missing in environment variables');
  }

  const host = String(process.env.SMTP_HOST || '').trim();

  // Works for Gmail app passwords when SMTP_HOST is set to smtp.gmail.com
  // (or when SMTP_SERVICE=gmail is used).
  const transportOptions =
    process.env.SMTP_SERVICE && String(process.env.SMTP_SERVICE).toLowerCase() === 'gmail'
      ? {
          service: 'gmail',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        }
      : {
          host,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
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
  verifiedOnce = true;

  const t = getTransporter();
  await t.verify();
};

module.exports = { getTransporter, verifyTransporter };

