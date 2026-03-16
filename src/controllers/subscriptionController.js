const EmailSubscription = require('../models/EmailSubscription');
const { sendEmail } = require('../services/emailService');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const messageToHtml = (message) => {
  const safe = escapeHtml(message || '').replace(/\r?\n/g, '<br/>');
  return `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111"><p>${safe}</p></div>`;
};

const subscribeEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    const subscription = await EmailSubscription.findOneAndUpdate(
      { email },
      { $set: { email, status: 'subscribed' } },
      { new: true, upsert: true, runValidators: true }
    );

    const ownerEmail = process.env.CLINIC_OWNER_EMAIL;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: 'New newsletter subscription',
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
            <h2 style="margin:0 0 12px">New subscription</h2>
            <p style="margin:0"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin:8px 0 0;color:#555;font-size:12px">Sent from Dental website</p>
          </div>
        `,
      });
    }

    res.status(201).json({
      message: 'Subscribed successfully',
      subscription,
    });
  } catch (err) {
    // Handle unique index race gracefully
    if (err && err.code === 11000) {
      try {
        const email = normalizeEmail(req.body.email);
        const subscription = await EmailSubscription.findOneAndUpdate(
          { email },
          { $set: { status: 'subscribed' } },
          { new: true }
        );
        return res.status(200).json({ message: 'Already subscribed', subscription });
      } catch (e) {
        return next(e);
      }
    }
    next(err);
  }
};

const listSubscriptionsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const status = (req.query.status || 'subscribed').toString();
    const q = (req.query.q || '').toString().trim().toLowerCase();

    const filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    if (q) {
      filter.email = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      EmailSubscription.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EmailSubscription.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    next(err);
  }
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const sendBulkEmailAdmin = async (req, res, next) => {
  try {
    const { subject, message, html, mode, selectedIds = [], selectedEmails = [] } = req.body;

    let recipients = [];

    if (mode === 'selected') {
      const ids = selectedIds.filter(Boolean);
      const emails = selectedEmails.map(normalizeEmail).filter(Boolean);

      const fromIds = ids.length
        ? await EmailSubscription.find({ _id: { $in: ids } }, { email: 1, status: 1 }).lean()
        : [];

      recipients = [
        ...fromIds.filter((x) => x.status === 'subscribed').map((x) => x.email),
        ...emails,
      ];
    } else {
      const all = await EmailSubscription.find({ status: 'subscribed' }, { email: 1 }).lean();
      recipients = all.map((x) => x.email);
    }

    // de-dupe
    recipients = Array.from(new Set(recipients.map(normalizeEmail).filter(Boolean)));

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No subscribed recipients found' });
    }

    const renderedHtml = html ? html : messageToHtml(message);
    const from = process.env.MAIL_FROM;

    // Use BCC batches to avoid exposing addresses + reduce SMTP limits.
    const batches = chunk(recipients, Number(process.env.BULK_EMAIL_BATCH_SIZE) || 50);

    let sentBatches = 0;
    for (const b of batches) {
      await sendEmail({
        to: from || process.env.CLINIC_OWNER_EMAIL || b[0],
        bcc: b,
        subject,
        html: renderedHtml,
      });
      sentBatches += 1;
    }

    res.json({
      message: 'Bulk email queued successfully',
      recipientsCount: recipients.length,
      batches: sentBatches,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  subscribeEmail,
  listSubscriptionsAdmin,
  sendBulkEmailAdmin,
};

