const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'maternity', 'paternity', 'casual', 'emergency', 'unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedAt: Date,
  rejectionReason: String,
  attachments: [{
    name: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first-half', 'second-half'],
    default: null
  },
  emergencyContact: {
    name: String,
    phone: String
  },
  workHandover: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    notes: String
  }
}, {
  timestamps: true
});

// Virtual for leave duration in days
leaveSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return this.isHalfDay ? 0.5 : diffDays;
});

// Index for efficient queries
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);

// commit-49: feat(leave): add leave type field
