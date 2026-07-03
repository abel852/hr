const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    photoUrl: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      region: String,
      postalCode: String
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  profile: {
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
      max: 80
    },
    languages: [
      {
        name: { type: String, trim: true },
        proficiencyPercent: { type: Number, min: 0, max: 100 }
      }
    ]
  },
  employmentInfo: {
    department: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    hireDate: {
      type: Date,
      required: true
    },
    contractType: {
      type: String,
      enum: ['permanent', 'contract', 'intern', 'part-time'],
      required: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated', 'on-leave'],
      default: 'active'
    }
  },
  salary: {
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
    deductions: {
      pension: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['id', 'contract', 'certificate', 'other'],
      required: true
    },
    name: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  bankInfo: {
    bankName: String,
    accountNumber: String,
    branch: String
  }
}, {
  timestamps: true
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Index for search
employeeSchema.index({ 
  'personalInfo.firstName': 'text', 
  'personalInfo.lastName': 'text',
  'personalInfo.email': 'text',
  'employmentInfo.department': 'text',
  'employmentInfo.position': 'text'
});

module.exports = mongoose.model('Employee', employeeSchema);





