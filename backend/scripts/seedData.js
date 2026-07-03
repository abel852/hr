const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Position = require('../models/Position');
const LeavePolicy = require('../models/LeavePolicy');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    await Role.deleteMany({});
    await Department.deleteMany({});
    await Position.deleteMany({});
    await LeavePolicy.deleteMany({});
    // Seed roles/permissions
    const roles = await Role.insertMany([
      {
        name: 'admin',
        label: 'Administrator',
        permissions: [
          'departments:read','departments:write',
          'positions:read','positions:write',
          'policies:read','policies:write'
        ]
      },
      {
        name: 'manager',
        label: 'Manager',
        permissions: [
          'departments:read','positions:read','policies:read'
        ]
      },
      {
        name: 'employee',
        label: 'Employee',
        permissions: []
      }
    ]);
    console.log(`Seeded ${roles.length} roles`);

    // Seed departments
    const departments = await Department.insertMany([
      { name: 'Human Resources' },
      { name: 'Finance' },
      { name: 'IT' },
      { name: 'Marketing' }
    ]);
    console.log(`Seeded ${departments.length} departments`);

    console.log('Cleared existing data');

    // Create sample employees
    const employees = [
      {
        employeeId: 'EMP0001',
        personalInfo: {
          firstName: 'Alemayehu',
          lastName: 'Kebede',
          middleName: 'Tadesse',
          phone: '+251911234567',
          email: 'alemayehu.kebede@company.com',
          address: {
            street: 'Bole Road',
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            postalCode: '1000'
          },
          gender: 'male',
          dateOfBirth: new Date('1985-03-15'),
          emergencyContact: {
            name: 'Tigist Kebede',
            relationship: 'Wife',
            phone: '+251911234568'
          }
        },
        employmentInfo: {
          department: 'Human Resources',
          position: 'HR Manager',
          hireDate: new Date('2020-01-15'),
          contractType: 'permanent',
          status: 'active'
        },
        salary: {
          basicSalary: 25000,
          allowances: {
            transport: 2000,
            housing: 5000,
            medical: 1500,
            other: 0
          }
        },
        bankInfo: {
          bankName: 'Commercial Bank of Ethiopia',
          accountNumber: '1000123456789',
          branch: 'Bole Branch'
        }
      },
      {
        employeeId: 'EMP0002',
        personalInfo: {
          firstName: 'Meron',
          lastName: 'Tesfaye',
          phone: '+251922345678',
          email: 'meron.tesfaye@company.com',
          address: {
            street: 'Kazanchis',
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            postalCode: '1000'
          },
          gender: 'female',
          dateOfBirth: new Date('1990-07-22'),
          emergencyContact: {
            name: 'Yonas Tesfaye',
            relationship: 'Brother',
            phone: '+251922345679'
          }
        },
        employmentInfo: {
          department: 'Finance',
          position: 'Finance Manager',
          hireDate: new Date('2021-06-01'),
          contractType: 'permanent',
          status: 'active'
        },
        salary: {
          basicSalary: 22000,
          allowances: {
            transport: 2000,
            housing: 4000,
            medical: 1500,
            other: 0
          }
        },
        bankInfo: {
          bankName: 'Awash Bank',
          accountNumber: '2000123456789',
          branch: 'Kazanchis Branch'
        }
      },
      {
        employeeId: 'EMP0003',
        personalInfo: {
          firstName: 'Dawit',
          lastName: 'Hailu',
          phone: '+251933456789',
          email: 'dawit.hailu@company.com',
          address: {
            street: 'Merkato',
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            postalCode: '1000'
          },
          gender: 'male',
          dateOfBirth: new Date('1992-11-08'),
          emergencyContact: {
            name: 'Selam Hailu',
            relationship: 'Sister',
            phone: '+251933456790'
          }
        },
        employmentInfo: {
          department: 'IT',
          position: 'Software Developer',
          hireDate: new Date('2022-03-10'),
          contractType: 'permanent',
          status: 'active'
        },
        salary: {
          basicSalary: 18000,
          allowances: {
            transport: 1500,
            housing: 3000,
            medical: 1000,
            other: 0
          }
        },
        bankInfo: {
          bankName: 'Abyssinia Bank',
          accountNumber: '3000123456789',
          branch: 'Merkato Branch'
        }
      },
      {
        employeeId: 'EMP0004',
        personalInfo: {
          firstName: 'Hirut',
          lastName: 'Gebre',
          phone: '+251944567890',
          email: 'hirut.gebre@company.com',
          address: {
            street: 'Piazza',
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            postalCode: '1000'
          },
          gender: 'female',
          dateOfBirth: new Date('1988-05-12'),
          emergencyContact: {
            name: 'Mulu Gebre',
            relationship: 'Mother',
            phone: '+251944567891'
          }
        },
        employmentInfo: {
          department: 'Marketing',
          position: 'Marketing Coordinator',
          hireDate: new Date('2021-09-15'),
          contractType: 'permanent',
          status: 'active'
        },
        salary: {
          basicSalary: 15000,
          allowances: {
            transport: 1500,
            housing: 2500,
            medical: 1000,
            other: 0
          }
        },
        bankInfo: {
          bankName: 'Commercial Bank of Ethiopia',
          accountNumber: '4000123456789',
          branch: 'Piazza Branch'
        }
      }
    ];

    const createdEmployees = await Employee.insertMany(employees);
    console.log(`Created ${createdEmployees.length} employees`);

    // Create users for employees
    const users = [
      {
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        employeeId: createdEmployees[0]._id,
        language: 'en'
      },
      {
        email: 'manager@company.com',
        password: 'password123',
        role: 'manager',
        employeeId: createdEmployees[1]._id,
        language: 'en'
      },
      {
        email: 'employee@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: createdEmployees[2]._id,
        language: 'am'
      },
      {
        email: 'hirut.gebre@company.com',
        password: 'password123',
        role: 'employee',
        employeeId: createdEmployees[3]._id,
        language: 'en'
      }
    ];

    const createdUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Update manager references
    await Employee.findByIdAndUpdate(createdEmployees[2]._id, {
      'employmentInfo.manager': createdEmployees[1]._id
    });
    await Employee.findByIdAndUpdate(createdEmployees[3]._id, {
      'employmentInfo.manager': createdEmployees[1]._id
    });

    // Create sample attendance records for the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const attendanceRecords = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of createdEmployees) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.random() * 2, Math.random() * 60, 0, 0); // 8-10 AM

        const checkOutTime = new Date(checkInTime);
        checkOutTime.setHours(17 + Math.random() * 2, Math.random() * 60, 0, 0); // 5-7 PM

        const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        const overtime = Math.max(0, totalHours - 8);

        attendanceRecords.push({
          employee: employee._id,
          date: date,
          checkIn: {
            time: checkInTime,
            location: 'Office',
            method: 'manual'
          },
          checkOut: {
            time: checkOutTime,
            location: 'Office',
            method: 'manual'
          },
          totalHours: Math.round(totalHours * 100) / 100,
          overtime: Math.round(overtime * 100) / 100,
          status: checkInTime.getHours() > 9 ? 'late' : 'present'
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    // Create sample leave requests
    const leaveRequests = [
      {
        employee: createdEmployees[2]._id,
        leaveType: 'annual',
        startDate: new Date(currentYear, currentMonth, 15),
        endDate: new Date(currentYear, currentMonth, 17),
        totalDays: 3,
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: createdEmployees[1]._id,
        approvedAt: new Date()
      },
      {
        employee: createdEmployees[3]._id,
        leaveType: 'sick',
        startDate: new Date(currentYear, currentMonth, 20),
        endDate: new Date(currentYear, currentMonth, 20),
        totalDays: 1,
        reason: 'Medical appointment',
        status: 'pending'
      }
    ];

    await Leave.insertMany(leaveRequests);
    console.log(`Created ${leaveRequests.length} leave requests`);

    // Create sample payroll records for the current month
    const payrollRecords = [];
    for (const employee of createdEmployees) {
      const grossSalary = employee.salary.basicSalary + 
        Object.values(employee.salary.allowances).reduce((sum, val) => sum + val, 0);
      
      const pension = Math.round(grossSalary * 0.07);
      const tax = Math.round(grossSalary * 0.15); // Simplified tax calculation
      const netSalary = grossSalary - pension - tax;

      payrollRecords.push({
        employee: employee._id,
        payPeriod: {
          startDate: new Date(currentYear, currentMonth, 1),
          endDate: new Date(currentYear, currentMonth + 1, 0),
          month: currentMonth + 1,
          year: currentYear
        },
        basicSalary: employee.salary.basicSalary,
        allowances: employee.salary.allowances,
        grossSalary: grossSalary,
        deductions: {
          pension: { employee: pension, employer: Math.round(grossSalary * 0.11) },
          tax: tax,
          other: 0
        },
        netSalary: netSalary,
        attendance: {
          totalDays: 22,
          presentDays: 20,
          absentDays: 1,
          lateDays: 1
        },
        leave: {
          takenDays: 0,
          unpaidDays: 0
        },
        status: 'draft',
        bankDetails: employee.bankInfo
      });
    }

    await Payroll.insertMany(payrollRecords);
    console.log(`Created ${payrollRecords.length} payroll records`);

    // Seed leave policy (place after core data)
    const defaultPolicy = new LeavePolicy({ name: 'Default Policy' });
    await defaultPolicy.save();
    console.log('Seeded default leave policy');

    console.log('Data seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: employee@company.com / password123');
    console.log('Employee: hirut.gebre@company.com / password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

