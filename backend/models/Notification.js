const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  type: { type: String, enum: ['message'], default: 'message' },
  dismissed: { type: Boolean, default: false },
  nextReminderAt: { type: Date, default: () => new Date(Date.now() + 60 * 60 * 1000) },
  lastSentAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, dismissed: 1, nextReminderAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);



// commit-79: feat(notifications): add notification types

// commit-80: feat(notifications): add push notification support
