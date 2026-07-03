const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/documents';
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
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// @route   GET /api/employees
// @desc    Get employees (admin: all; manager: limited to own department unless overridden)
// @access  Private (Admin, Manager)
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'employmentInfo.department': { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query['employmentInfo.department'] = department;
    } else if (req.user.role === 'manager' && req.user.employeeId) {
      const me = await Employee.findById(req.user.employeeId);
      if (me?.employmentInfo?.department) {
        query['employmentInfo.department'] = me.employmentInfo.department;
      }
    }

    if (status) {
      query['employmentInfo.status'] = status;
    }

    const employees = await Employee.find(query)
      .populate('employmentInfo.manager', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employmentInfo.manager', 'personalInfo.firstName personalInfo.lastName');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user can access this employee
    if (req.user.role === 'employee' && req.user.employeeId?.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @route   POST /api/employees
// @desc    Create new employee (Admin only)
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), upload.single('photo'), [
  body('personalInfo.firstName').notEmpty().trim(),
  body('personalInfo.lastName').notEmpty().trim(),
  body('personalInfo.email').isEmail().normalizeEmail(),
  body('personalInfo.phone').notEmpty().trim(),
  body('personalInfo.gender').isIn(['male', 'female', 'other']),
  body('employmentInfo.department').notEmpty().trim(),
  body('employmentInfo.position').notEmpty().trim(),
  body('employmentInfo.hireDate').isISO8601(),
  body('employmentInfo.contractType').isIn(['permanent', 'contract', 'intern', 'part-time']),
  body('salary.basicSalary').isNumeric(),
  body('profile.experienceYears').optional().isInt({ min: 0, max: 80 }),
  body('profile.languages').optional().isArray(),
  body('profile.languages.*.name').optional().isString().trim(),
  body('profile.languages.*.proficiencyPercent').optional().isInt({ min: 0, max: 100 }),
  body('account.role').optional().isIn(['admin', 'manager', 'employee']),
  body('account.sendEmail').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate employee ID
    const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
    const employeeId = lastEmployee ? 
      `EMP${String(parseInt(lastEmployee.employeeId.replace('EMP', '')) + 1).padStart(4, '0')}` :
      'EMP0001';

    const employeeData = {
      ...req.body,
      employeeId
    };
    if (req.file) {
      employeeData.personalInfo = employeeData.personalInfo || {};
      employeeData.personalInfo.photoUrl = req.file.path;
    }

    const employee = new Employee(employeeData);
    await employee.save();

    // Create user account for employee
    const generatedPassword = Math.random().toString(36).slice(-10);
    const role = req.body?.account?.role || 'employee';
    const user = new User({
      email: employee.personalInfo.email,
      password: generatedPassword,
      role,
      employeeId: employee._id
    });

    await user.save();

    // Optionally send credentials via email
    const shouldSendEmail = !!req.body?.account?.sendEmail;
    if (shouldSendEmail) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.MAIL_FROM || 'no-reply@hr-system.local',
          to: employee.personalInfo.email,
          subject: 'Your HR System account credentials',
          text: `Hello ${employee.personalInfo.firstName},\n\nYour account has been created.\nEmail: ${employee.personalInfo.email}\nPassword: ${generatedPassword}\nRole: ${role}\n\nPlease log in and change your password.`,
          html: `<p>Hello ${employee.personalInfo.firstName},</p>
                 <p>Your account has been created.</p>
                 <ul>
                   <li><strong>Email:</strong> ${employee.personalInfo.email}</li>
                   <li><strong>Password:</strong> ${generatedPassword}</li>
                   <li><strong>Role:</strong> ${role}</li>
                 </ul>
                 <p>Please log in and change your password.</p>`
        });
      } catch (mailErr) {
        console.error('Email send error:', mailErr.message);
      }
    }

    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin, Manager)
router.put('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id/assign-manager
// @desc    Assign or change employee's manager
// @access  Private (Admin, Manager)
router.put('/:id/assign-manager', auth, authorize('admin', 'manager'), [
  body('managerId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { managerId } = req.body;
    const manager = await Employee.findById(managerId);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { 'employmentInfo.manager': managerId },
      { new: true }
    ).populate('employmentInfo.manager', 'personalInfo.firstName personalInfo.lastName');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Deactivate user account instead of deleting
    await User.findOneAndUpdate(
      { employeeId: req.params.id },
      { isActive: false }
    );

    // Update employee status
    employee.employmentInfo.status = 'terminated';
    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees/:id/documents
// @desc    Upload employee document
// @access  Private (Admin, Manager)
router.post('/:id/documents', auth, authorize('admin', 'manager'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = {
      type: req.body.type,
      name: req.file.originalname,
      filePath: req.file.path
    };

    employee.documents.push(document);
    await employee.save();

    res.json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/departments
// @desc    Get all departments
// @access  Private
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Employee.distinct('employmentInfo.department');
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
