const express = require('express');
const { body, validationResult } = require('express-validator');
const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/performance
// @desc    List performance reviews
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, employeeId, evaluatorId, status, year, quarter } = req.query;

    const query = {};
    if (employeeId) query.employee = employeeId;
    if (evaluatorId) query.evaluator = evaluatorId;
    if (status) query.status = status;
    if (year) query['period.year'] = parseInt(year);
    if (quarter) query['period.quarter'] = parseInt(quarter);

    // Employees only see their reviews
    if (req.user.role === 'employee') {
      query.employee = req.user.employeeId;
    }

    const reviews = await Performance.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('evaluator', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Performance.countDocuments(query);
    res.json({ reviews, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (error) {
    console.error('List performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/performance
// @desc    Create a performance review
// @access  Private (Manager, Admin)
router.post('/', auth, authorize('manager', 'admin'), [
  body('employee').isMongoId(),
  body('period.year').isNumeric(),
  body('period.quarter').isInt({ min: 1, max: 4 }),
  body('period.startDate').isISO8601(),
  body('period.endDate').isISO8601(),
  body('kpis').isArray().optional(),
  body('rating').isIn(['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = {
      ...req.body,
      evaluator: req.user.employeeId
    };

    const review = new Performance(data);
    await review.save();
    await review.populate('employee', 'personalInfo.firstName personalInfo.lastName');
    await review.populate('evaluator', 'personalInfo.firstName personalInfo.lastName');

    res.status(201).json(review);
  } catch (error) {
    console.error('Create performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/performance/:id
// @desc    Update a performance review
// @access  Private (Manager, Admin)
router.put('/:id', auth, authorize('manager', 'admin'), async (req, res) => {
  try {
    const review = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    console.error('Update performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/performance/stats
// @desc    Get performance statistics for employee or department
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    const match = {};

    if (employeeId) {
      match.employee = employeeId;
    } else if (req.user.role === 'employee') {
      match.employee = req.user.employeeId;
    }

    if (year) match['period.year'] = parseInt(year);

    const stats = await Performance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/performance/:id/kpis
// @desc    Add or replace KPIs
// @access  Private (Manager, Admin)
router.post('/:id/kpis', auth, authorize('manager', 'admin'), [
  body('kpis').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Performance.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.kpis = req.body.kpis;
    // Recalculate overall score if needed
    review.overallScore = review.calculatedScore;
    await review.save();
    res.json(review);
  } catch (error) {
    console.error('Update KPIs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


