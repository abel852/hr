const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    transport: { type: Number, default: 0 },
    housing: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  overtime: {
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  grossSalary: {
    type: Number,
    required: true
  },
  deductions: {
    pension: {
      employee: { type: Number, default: 0 },
      employer: { type: Number, default: 0 }
    },
    tax: {
      type: Number,
      default: 0
    },
    other: { type: Number, default: 0 }
  },
  netSalary: {
    type: Number,
    required: true
  },
  attendance: {
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    lateDays: { type: Number, default: 0 }
  },
  leave: {
    takenDays: { type: Number, default: 0 },
    unpaidDays: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check'],
    default: 'bank_transfer'
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    branch: String
  },
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipPath: String,
  notes: String
}, {
  timestamps: true
});

// Compound index for efficient queries
payrollSchema.index({ employee: 1, 'payPeriod.year': 1, 'payPeriod.month': 1 }, { unique: true });

// Virtual for total allowances
payrollSchema.virtual('totalAllowances').get(function() {
  return this.allowances.transport + this.allowances.housing + 
         this.allowances.medical + this.allowances.other;
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return this.deductions.pension.employee + this.deductions.tax + this.deductions.other;
});

module.exports = mongoose.model('Payroll', payrollSchema);

// commit-59: feat(payroll): add tax deduction fields

// commit-60: feat(payroll): add bonus calculation fields

// commit-61: feat(payroll): add overtime pay fields
