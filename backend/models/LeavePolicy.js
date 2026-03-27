const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balances: {
    annual: { type: Number, default: 21 },
    sick: { type: Number, default: 7 },
    maternity: { type: Number, default: 90 },
    paternity: { type: Number, default: 15 },
    casual: { type: Number, default: 5 },
    emergency: { type: Number, default: 3 },
    unpaid: { type: Number, default: 0 }
  },
  appliesToDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  appliesToPositions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Position' }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);



// commit-52: feat(leave): define annual leave policy

// commit-53: feat(leave): add sick leave policy

// commit-54: feat(leave): add carry-over leave rules
