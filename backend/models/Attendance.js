const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: Date,
    location: String,
    method: {
      type: String,
      enum: ['manual', 'biometric', 'mobile'],
      default: 'manual'
    }
  },
  checkOut: {
    time: Date,
    location: String,
    method: {
      type: String,
      enum: ['manual', 'biometric', 'mobile'],
      default: 'manual'
    }
  },
  breakTime: {
    start: Date,
    end: Date,
    duration: Number // in minutes
  },
  totalHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
    default: 'present'
  },
  notes: String,
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    default: 'morning'
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  holidayType: {
    type: String,
    enum: ['national', 'religious', 'company'],
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Virtual for calculating total hours
attendanceSchema.virtual('calculatedHours').get(function() {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  }
  return 0;
});

module.exports = mongoose.model('Attendance', attendanceSchema);

// commit-41: feat(attendance): add overtime calculation field

// commit-42: feat(attendance): add late clock-in tracking

// commit-43: feat(attendance): add geo-location tracking
