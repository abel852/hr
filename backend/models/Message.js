const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  subject: {
    type: String,
    trim: true,
    default: ''
  },
  body: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file'],
      default: 'image'
    },
    name: String,
    filePath: String,
    size: Number
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  readAt: {
    type: Date,
    default: null
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  // Recycle bin metadata per user/role deletion
  trashEntries: [{
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    role: { type: String, enum: ['employee', 'manager', 'admin'], required: true },
    deletedAt: { type: Date, default: Date.now },
    escalatedToAdmin: { type: Boolean, default: false },
    escalatedAt: { type: Date, default: null }
  }],
  // When in admin recycle bin (after escalation)
  adminTrash: {
    active: { type: Boolean, default: false },
    escalatedFromRole: { type: String, enum: ['employee', 'manager', null], default: null },
    escalatedAt: { type: Date, default: null }
  }
}, {
  timestamps: true
});

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ 'trashEntries.deletedAt': 1 });
messageSchema.index({ 'adminTrash.active': 1, 'adminTrash.escalatedAt': 1 });

module.exports = mongoose.model('Message', messageSchema);


