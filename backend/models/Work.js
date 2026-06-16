const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  attachments: [{ name: String, filePath: String, size: Number }],
  submittedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, default: null },
  status: { type: String, enum: ['green', 'yellow', 'red', 'pending'], default: 'pending' },
  managerComment: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Work', workSchema);



// commit-83: feat(work): add task status field

// commit-84: feat(work): add task priority field

// commit-85: feat(work): add task assignee field
