const express = require('express');
const { body, validationResult } = require('express-validator');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { auth, authorize } = require('../middleware/auth');
const { generatePayslipData } = require('../utils/payrollCalculations');
const puppeteer = require('puppeteer');
const path = require('path');

const router = express.Router();

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private (Admin, Manager)
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      employeeId, 
      year, 
      month, 
      status,
      department 
    } = req.query;

    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (year) {
      query['payPeriod.year'] = parseInt(year);
    }

    if (month) {
      query['payPeriod.month'] = parseInt(month);
    }

    if (status) {
      query.status = status;
    }

    // Department filter
    if (department) {
      const employees = await Employee.find({ 'employmentInfo.department': department });
      query.employee = { $in: employees.map(emp => emp._id) };
    }

    const payroll = await Payroll.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payroll.countDocuments(query);

    res.json({
      payroll,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get payroll record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Check access
    if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payroll/generate
// @desc    Generate payroll for all employees
// @access  Private (Admin)
router.post('/generate', auth, authorize('admin'), [
  body('year').isNumeric(),
  body('month').isNumeric().isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, month } = req.body;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get all active employees
    const employees = await Employee.find({ 'employmentInfo.status': 'active' });

    const payrollRecords = [];

    for (const employee of employees) {
      // Check if payroll already exists for this employee and period
      const existingPayroll = await Payroll.findOne({
        employee: employee._id,
        'payPeriod.year': year,
        'payPeriod.month': month
      });

      if (existingPayroll) {
        continue; // Skip if already generated
      }

      // Get attendance data for the month
      const attendance = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate }
      });

      // Get leave data for the month
      const leaves = await Leave.find({
        employee: employee._id,
        status: 'approved',
        $or: [
          {
            startDate: { $gte: startDate, $lte: endDate }
          },
          {
            endDate: { $gte: startDate, $lte: endDate }
          }
        ]
      });

      // Calculate attendance stats
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const lateDays = attendance.filter(a => a.status === 'late').length;
      const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
      const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

      // Calculate leave days
      const takenLeaveDays = leaves.reduce((sum, leave) => {
        const leaveStart = new Date(Math.max(leave.startDate, startDate));
        const leaveEnd = new Date(Math.min(leave.endDate, endDate));
        const days = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (leave.isHalfDay ? 0.5 : days);
      }, 0);

      // Generate payroll data
      const payrollData = generatePayslipData(employee, {
        basicSalary: employee.salary.basicSalary,
        allowances: employee.salary.allowances,
        overtime: {
          hours: overtimeHours,
          amount: 0 // Will be calculated
        }
      });

      // Calculate overtime amount
      const overtimeAmount = overtimeHours > 0 ? 
        (employee.salary.basicSalary / (8 * 22)) * 1.5 * overtimeHours : 0;

      const payrollRecord = new Payroll({
        employee: employee._id,
        payPeriod: {
          startDate,
          endDate,
          month,
          year
        },
        basicSalary: payrollData.basicSalary,
        allowances: payrollData.allowances,
        overtime: {
          hours: overtimeHours,
          rate: employee.salary.basicSalary / (8 * 22) * 1.5,
          amount: Math.round(overtimeAmount)
        },
        grossSalary: payrollData.grossSalary + Math.round(overtimeAmount),
        deductions: payrollData.deductions,
        netSalary: payrollData.netSalary + Math.round(overtimeAmount),
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays
        },
        leave: {
          takenDays: takenLeaveDays,
          unpaidDays: 0 // Can be calculated based on leave type
        },
        bankDetails: employee.bankInfo
      });

      await payrollRecord.save();
      payrollRecords.push(payrollRecord);
    }

    res.status(201).json({
      message: `Payroll generated for ${payrollRecords.length} employees`,
      records: payrollRecords.length
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/payroll/:id/approve
// @desc    Approve payroll record
// @access  Private (Admin)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('employee', 'personalInfo.firstName personalInfo.lastName');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/:id/payslip
// @desc    Generate payslip PDF
// @access  Private
router.get('/:id/payslip', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName employmentInfo.department');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Check access
    if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.user.employeeId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${payroll.employee.personalInfo.firstName} ${payroll.employee.personalInfo.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; }
          .payslip-title { font-size: 18px; margin: 10px 0; }
          .employee-info { margin-bottom: 20px; }
          .payroll-details { display: flex; justify-content: space-between; }
          .earnings, .deductions { width: 45%; }
          .section-title { font-weight: bold; margin-bottom: 10px; }
          .line-item { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">HR System Company</div>
          <div class="payslip-title">PAYSLIP</div>
          <div>Period: ${payroll.payPeriod.month}/${payroll.payPeriod.year}</div>
        </div>
        
        <div class="employee-info">
          <div><strong>Employee:</strong> ${payroll.employee.personalInfo.firstName} ${payroll.employee.personalInfo.lastName}</div>
          <div><strong>Department:</strong> ${payroll.employee.employmentInfo.department}</div>
        </div>
        
        <div class="payroll-details">
          <div class="earnings">
            <div class="section-title">EARNINGS</div>
            <div class="line-item">
              <span>Basic Salary:</span>
              <span>ETB ${payroll.basicSalary.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Transport Allowance:</span>
              <span>ETB ${payroll.allowances.transport.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Housing Allowance:</span>
              <span>ETB ${payroll.allowances.housing.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Medical Allowance:</span>
              <span>ETB ${payroll.allowances.medical.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Other Allowances:</span>
              <span>ETB ${payroll.allowances.other.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Overtime:</span>
              <span>ETB ${payroll.overtime.amount.toLocaleString()}</span>
            </div>
            <div class="line-item total">
              <span>Gross Salary:</span>
              <span>ETB ${payroll.grossSalary.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="deductions">
            <div class="section-title">DEDUCTIONS</div>
            <div class="line-item">
              <span>Pension (7%):</span>
              <span>ETB ${payroll.deductions.pension.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Income Tax:</span>
              <span>ETB ${payroll.deductions.tax.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Other Deductions:</span>
              <span>ETB ${payroll.deductions.other.toLocaleString()}</span>
            </div>
            <div class="line-item total">
              <span>Total Deductions:</span>
              <span>ETB ${(payroll.deductions.pension + payroll.deductions.tax + payroll.deductions.other).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="line-item total" style="margin-top: 20px; font-size: 18px;">
          <span>NET SALARY:</span>
          <span>ETB ${payroll.netSalary.toLocaleString()}</span>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated payslip. No signature required.</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="payslip-${payroll.employee.personalInfo.firstName}-${payroll.payPeriod.month}-${payroll.payPeriod.year}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/export/bank-transfer
// @desc    Export bank transfer sheet
// @access  Private (Admin)
router.get('/export/bank-transfer', auth, authorize('admin'), async (req, res) => {
  try {
    const { year, month, bank } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const query = {
      'payPeriod.year': parseInt(year),
      'payPeriod.month': parseInt(month),
      status: 'approved'
    };

    if (bank) {
      query['bankDetails.bankName'] = bank;
    }

    const payrollRecords = await Payroll.find(query)
      .populate('employee', 'personalInfo.firstName personalInfo.lastName bankInfo');

    // Generate CSV data
    const csvData = payrollRecords.map(record => ({
      'Employee Name': `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}`,
      'Bank Name': record.bankDetails.bankName || record.employee.bankInfo?.bankName || '',
      'Account Number': record.bankDetails.accountNumber || record.employee.bankInfo?.accountNumber || '',
      'Branch': record.bankDetails.branch || record.employee.bankInfo?.branch || '',
      'Amount': record.netSalary
    }));

    // Convert to CSV
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bank-transfer-${month}-${year}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export bank transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// commit-64: feat(payroll): add payroll generation endpoint

// commit-65: feat(payroll): add payslip download endpoint
