// Ethiopian payroll calculations based on ERCA tax brackets and social security

const calculatePAYE = (grossSalary) => {
  // Ethiopian tax brackets for 2024 (monthly)
  const taxBrackets = [
    { min: 0, max: 600, rate: 0 },
    { min: 601, max: 1650, rate: 0.10 },
    { min: 1651, max: 3200, rate: 0.15 },
    { min: 3201, max: 5250, rate: 0.20 },
    { min: 5251, max: 7800, rate: 0.25 },
    { min: 7801, max: 10900, rate: 0.30 },
    { min: 10901, max: 15000, rate: 0.35 },
    { min: 15001, max: 20000, rate: 0.40 },
    { min: 20001, max: Infinity, rate: 0.45 }
  ];

  let tax = 0;
  let remainingSalary = grossSalary;

  for (const bracket of taxBrackets) {
    if (remainingSalary <= 0) break;
    
    const taxableAmount = Math.min(remainingSalary, bracket.max - bracket.min + 1);
    if (taxableAmount > 0) {
      tax += taxableAmount * bracket.rate;
      remainingSalary -= taxableAmount;
    }
  }

  return Math.round(tax);
};

const calculatePension = (grossSalary) => {
  // Employee contributes 7%, Employer contributes 11%
  const employeeContribution = Math.round(grossSalary * 0.07);
  const employerContribution = Math.round(grossSalary * 0.11);
  
  return {
    employee: employeeContribution,
    employer: employerContribution,
    total: employeeContribution + employerContribution
  };
};

const calculateOvertime = (basicSalary, overtimeHours) => {
  // Overtime rate: 1.5x for weekdays, 2x for weekends/holidays
  const hourlyRate = basicSalary / (8 * 22); // Assuming 8 hours/day, 22 working days/month
  const overtimeRate = hourlyRate * 1.5; // Weekday overtime
  
  return Math.round(overtimeHours * overtimeRate);
};

const calculateNetSalary = (grossSalary, deductions) => {
  const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + amount, 0);
  return Math.round(grossSalary - totalDeductions);
};

const generatePayslipData = (employee, payrollData) => {
  const basicSalary = payrollData.basicSalary || employee.salary.basicSalary;
  const allowances = payrollData.allowances || employee.salary.allowances;
  const totalAllowances = Object.values(allowances).reduce((sum, amount) => sum + amount, 0);
  
  const grossSalary = basicSalary + totalAllowances + (payrollData.overtime?.amount || 0);
  
  const pension = calculatePension(grossSalary);
  const tax = calculatePAYE(grossSalary);
  
  const deductions = {
    pension: pension.employee,
    tax: tax,
    other: payrollData.deductions?.other || 0
  };
  
  const netSalary = calculateNetSalary(grossSalary, deductions);
  
  return {
    basicSalary,
    allowances,
    totalAllowances,
    grossSalary,
    deductions,
    netSalary,
    pension: {
      employee: pension.employee,
      employer: pension.employer
    }
  };
};

module.exports = {
  calculatePAYE,
  calculatePension,
  calculateOvertime,
  calculateNetSalary,
  generatePayslipData
};

// commit-67: feat(payroll): add tax bracket calculation

// commit-68: feat(payroll): add overtime rate calculation
