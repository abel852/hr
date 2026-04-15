const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    quarter: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true
    }
  },
  kpis: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    target: Number,
    actual: Number,
    weight: {
      type: Number,
      min: 0,
      max: 100
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  rating: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
    required: true
  },
  strengths: [String],
  areasForImprovement: [String],
  goals: [{
    goal: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started'
    }
  }],
  trainingHistory: [{
    course: String,
    provider: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'cancelled'],
      default: 'in_progress'
    },
    certificate: String
  }],
  comments: {
    employee: String,
    evaluator: String,
    hr: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved'],
    default: 'draft'
  },
  nextReviewDate: Date
}, {
  timestamps: true
});

// Index for efficient queries
performanceSchema.index({ employee: 1, 'period.year': 1, 'period.quarter': 1 });
performanceSchema.index({ evaluator: 1, status: 1 });

// Virtual for calculated overall score
performanceSchema.virtual('calculatedScore').get(function() {
  if (this.kpis.length === 0) return 0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  this.kpis.forEach(kpi => {
    totalWeightedScore += (kpi.score * kpi.weight);
    totalWeight += kpi.weight;
  });
  
  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
});

module.exports = mongoose.model('Performance', performanceSchema);

// commit-69: feat(performance): add KPI fields

// commit-70: feat(performance): add reviewer comments field

// commit-71: feat(performance): add goal tracking fields
