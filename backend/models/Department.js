const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);



// commit-33: feat(departments): add department head field

// commit-34: feat(departments): add budget allocation field
