const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: String,
  responsibilities: [String]
}, {
  timestamps: true
});

positionSchema.index({ title: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Position', positionSchema);



// commit-36: feat(positions): add salary range fields

// commit-37: feat(positions): add job description field

// commit-38: feat(positions): add required skills field
