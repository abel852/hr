const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    enum: ['admin', 'manager', 'employee']
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

roleSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);



// commit-39: feat(roles): add permission matrix
