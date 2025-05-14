const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for leave attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/leave-attachments';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/leave
// @desc    Get leave requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      leaveType, 
      startDate, 
      endDate,
      employeeId 
    } = req.query;

    const query = {};

    // Filter by employee
    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'employee') {
      query.employee = req.user.employeeId;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Leave type filter
    if (leaveType) {
      query.leaveType = leaveType;
    }

    // Date range filter
    if (startDate && endDate) {
      query.$or = [
        {
          startDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          endDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ];
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('approvedBy', 'personalInfo.firstName personalInfo.lastName')
      .populate('workHandover.assignedTo', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leave
// @desc    Create leave request
// @access  Private
router.post('/', auth, [
  body('leaveType').isIn(['annual', 'sick', 'maternity', 'paternity', 'casual', 'emergency', 'unpaid']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').notEmpty().trim(),
  body('isHalfDay').optional().isBoolean(),
  body('halfDayType').optional().isIn(['first-half', 'second-half'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, isHalfDay } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    // Calculate total days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = isHalfDay ? 0.5 : diffDays;

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employee: req.user.employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({ 
        message: 'You have an overlapping leave request for this period' 
      });
    }

    const leaveData = {
      ...req.body,
      employee: req.user.employeeId,
      totalDays,
      startDate: start,
      endDate: end
    };

    const leave = new Leave(leaveData);
    await leave.save();

    await leave.populate('employee', 'personalInfo.firstName personalInfo.lastName');

    res.status(201).json(leave);
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leave/:id/approve
// @desc    Approve leave request
// @access  Private (Manager, Admin)
router.put('/:id/approve', auth, authorize('manager', 'admin'), async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is not pending' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user.employeeId;
    leave.approvedAt = new Date();

    await leave.save();
    await leave.populate('approvedBy', 'personalInfo.firstName personalInfo.lastName');

    res.json(leave);
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leave/:id/reject
// @desc    Reject leave request
// @access  Private (Manager, Admin)
router.put('/:id/reject', auth, authorize('manager', 'admin'), [
  body('rejectionReason').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request is not pending' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user.employeeId;
    leave.approvedAt = new Date();
    leave.rejectionReason = req.body.rejectionReason;

    await leave.save();
    await leave.populate('approvedBy', 'personalInfo.firstName personalInfo.lastName');

    res.json(leave);
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leave/:id/cancel
// @desc    Cancel leave request
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user can cancel this leave
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be cancelled' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json(leave);
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leave/:id/attachments
// @desc    Upload leave attachment
// @access  Private
router.post('/:id/attachments', auth, upload.single('attachment'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user can upload to this leave
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attachment = {
      name: req.file.originalname,
      filePath: req.file.path
    };

    leave.attachments.push(attachment);
    await leave.save();

    res.json({ message: 'Attachment uploaded successfully', attachment });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/balance/:employeeId
// @desc    Get leave balance for employee
// @access  Private
router.get('/balance/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Check access
    if (req.user.role === 'employee' && req.user.employeeId.toString() !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Get leave usage for the year
    const leaveUsage = await Leave.aggregate([
      {
        $match: {
          employee: employeeId,
          status: 'approved',
          startDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    // Default leave balances (can be configured per employee)
    const leaveBalances = {
      annual: 21,
      sick: 7,
      maternity: 90,
      paternity: 15,
      casual: 5,
      emergency: 3,
      unpaid: 0
    };

    // Calculate remaining balances
    const balances = {};
    Object.keys(leaveBalances).forEach(type => {
      const used = leaveUsage.find(usage => usage._id === type);
      balances[type] = {
        total: leaveBalances[type],
        used: used ? used.totalDays : 0,
        remaining: leaveBalances[type] - (used ? used.totalDays : 0)
      };
    });

    res.json(balances);
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// commit-55: feat(leave): add leave application endpoint
