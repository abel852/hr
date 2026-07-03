const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');
const Work = require('../models/Work');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      employeeId, 
      startDate, 
      endDate, 
      status,
      department 
    } = req.query;

    const query = {};

    // Filter by employee if specified
    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'employee') {
      // Employees can only see their own attendance
      query.employee = req.user.employeeId;
    }

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Department filter (for managers/admins)
    if (department && req.user.role !== 'employee') {
      const employees = await Employee.find({ 'employmentInfo.department': department });
      query.employee = { $in: employees.map(emp => emp._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/dashboard
// @desc    Employee dashboard overview: presence/late/absent and work ratings
// @access  Private (Employee)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const att = await Attendance.aggregate([
      { $match: { employee: employeeId, date: { $gte: start } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byStatus = att.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {});

    const workAgg = await Work.aggregate([
      { $match: { employee: employeeId, createdAt: { $gte: start } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const workByStatus = workAgg.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {});

    res.json({
      attendance: {
        present: byStatus.present || 0,
        late: byStatus.late || 0,
        absent: byStatus.absent || 0
      },
      work: {
        green: workByStatus.green || 0,
        yellow: workByStatus.yellow || 0,
        red: workByStatus.red || 0
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkin
// @desc    Check in employee
// @access  Private
router.post('/checkin', auth, [
  body('location').optional().trim(),
  body('method').optional().isIn(['manual', 'biometric', 'mobile'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn.time) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInData = {
      employee: req.user.employeeId,
      date: today,
      checkIn: {
        time: new Date(),
        location: req.body.location || '',
        method: req.body.method || 'manual'
      },
      status: 'present'
    };

    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = checkInData.checkIn;
      existingAttendance.status = 'present';
      await existingAttendance.save();
      res.json(existingAttendance);
    } else {
      // Create new record
      const attendance = new Attendance(checkInData);
      await attendance.save();
      res.status(201).json(attendance);
    }
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out employee
// @access  Private
router.post('/checkout', auth, [
  body('location').optional().trim(),
  body('method').optional().isIn(['manual', 'biometric', 'mobile'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    attendance.checkOut = {
      time: checkOutTime,
      location: req.body.location || '',
      method: req.body.method || 'manual'
    };

    // Calculate total hours
    if (attendance.checkIn.time) {
      const diffMs = checkOutTime - attendance.checkIn.time;
      const diffHours = diffMs / (1000 * 60 * 60);
      attendance.totalHours = Math.round(diffHours * 100) / 100;

      // Calculate overtime (assuming 8 hours is standard)
      if (diffHours > 8) {
        attendance.overtime = Math.round((diffHours - 8) * 100) / 100;
      }

      // Check for late arrival (assuming 9 AM is standard start time)
      const startTime = new Date(attendance.date);
      startTime.setHours(9, 0, 0, 0);
      if (attendance.checkIn.time > startTime) {
        attendance.status = 'late';
      }
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Admin, Manager)
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employee', 'personalInfo.firstName personalInfo.lastName');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    } else if (req.user.role === 'employee') {
      query.employee = req.user.employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          },
          totalHours: { $sum: '$totalHours' },
          totalOvertime: { $sum: '$overtime' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalHours: 0,
      totalOvertime: 0
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/annual
// @desc    Get annual attendance summary by employee for a year
// @access  Private (Admin, Manager)
router.get('/annual', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { year, employeeId, department } = req.query;
    const y = parseInt(year, 10) || new Date().getFullYear();
    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y + 1, 0, 1));

    const match = { date: { $gte: start, $lt: end } };

    if (employeeId) {
      match.employee = new require('mongoose').Types.ObjectId(employeeId);
    } else if (department) {
      const emps = await Employee.find({ 'employmentInfo.department': department }).select('_id');
      match.employee = { $in: emps.map(e => e._id) };
    }

    const summary = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$employee',
          days: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' },
          totalOvertime: { $sum: '$overtime' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 0,
          employeeId: '$employee._id',
          name: {
            $concat: [
              '$employee.personalInfo.firstName',
              ' ',
              '$employee.personalInfo.lastName'
            ]
          },
          department: '$employee.employmentInfo.department',
          days: 1,
          presentDays: 1,
          absentDays: 1,
          lateDays: 1,
          totalHours: 1,
          totalOvertime: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({ year: y, summary });
  } catch (error) {
    console.error('Annual summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
