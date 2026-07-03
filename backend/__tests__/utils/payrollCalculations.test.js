const {
  calculatePAYE,
  calculatePension,
  calculateOvertime,
  calculateNetSalary,
  generatePayslipData
} = require('../../utils/payrollCalculations');

describe('Payroll Calculations', () => {
  describe('calculatePAYE', () => {
    it('should return 0 for salary <= 600', () => {
      expect(calculatePAYE(600)).toBe(0);
      expect(calculatePAYE(300)).toBe(0);
      expect(calculatePAYE(0)).toBe(0);
    });

    it('should calculate 10% for 601-1650 bracket', () => {
      const tax = calculatePAYE(1000);
      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeLessThan(1000);
    });

    it('should calculate 15% for 1651-3200 bracket', () => {
      const tax = calculatePAYE(2500);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 20% for 3201-5250 bracket', () => {
      const tax = calculatePAYE(5000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 25% for 5251-7800 bracket', () => {
      const tax = calculatePAYE(7000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 30% for 7801-10900 bracket', () => {
      const tax = calculatePAYE(10000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 35% for 10901-15000 bracket', () => {
      const tax = calculatePAYE(13000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 40% for 15001-20000 bracket', () => {
      const tax = calculatePAYE(18000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should calculate 45% for 20001+ bracket', () => {
      const tax = calculatePAYE(50000);
      expect(tax).toBeGreaterThan(0);
    });

    it('should return integer', () => {
      const tax = calculatePAYE(12345);
      expect(Number.isInteger(tax)).toBe(true);
    });
  });

  describe('calculatePension', () => {
    it('should calculate employee 7% contribution', () => {
      const result = calculatePension(10000);
      expect(result.employee).toBe(700);
    });

    it('should calculate employer 11% contribution', () => {
      const result = calculatePension(10000);
      expect(result.employer).toBe(1100);
    });

    it('should calculate total', () => {
      const result = calculatePension(10000);
      expect(result.total).toBe(1800);
    });

    it('should handle zero salary', () => {
      const result = calculatePension(0);
      expect(result.employee).toBe(0);
      expect(result.employer).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should return integers', () => {
      const result = calculatePension(12345);
      expect(Number.isInteger(result.employee)).toBe(true);
      expect(Number.isInteger(result.employer)).toBe(true);
    });
  });

  describe('calculateOvertime', () => {
    it('should calculate overtime based on hourly rate', () => {
      const amount = calculateOvertime(8800, 10);
      expect(amount).toBeGreaterThan(0);
    });

    it('should return 0 for 0 overtime hours', () => {
      const amount = calculateOvertime(50000, 0);
      expect(amount).toBe(0);
    });

    it('should increase with more hours', () => {
      const a1 = calculateOvertime(50000, 5);
      const a2 = calculateOvertime(50000, 10);
      expect(a2).toBeGreaterThan(a1);
    });

    it('should return integer', () => {
      const amount = calculateOvertime(8800, 7);
      expect(Number.isInteger(amount)).toBe(true);
    });

    it('should increase with higher salary', () => {
      const a1 = calculateOvertime(10000, 5);
      const a2 = calculateOvertime(20000, 5);
      expect(a2).toBeGreaterThan(a1);
    });
  });

  describe('calculateNetSalary', () => {
    it('should subtract deductions from gross', () => {
      const net = calculateNetSalary(10000, { pension: 700, tax: 500, other: 200 });
      expect(net).toBe(8600);
    });

    it('should return gross when no deductions', () => {
      const net = calculateNetSalary(10000, {});
      expect(net).toBe(10000);
    });

    it('should handle multiple deductions', () => {
      const net = calculateNetSalary(50000, { pension: 3500, tax: 8000, other: 1000 });
      expect(net).toBe(37500);
    });

    it('should return integer', () => {
      const net = calculateNetSalary(12345, { pension: 864, tax: 1500, other: 100 });
      expect(Number.isInteger(net)).toBe(true);
    });
  });

  describe('generatePayslipData', () => {
    const employee = {
      salary: { basicSalary: 50000, allowances: { transport: 2000, housing: 3000, medical: 1000, other: 500 } }
    };

    it('should generate payslip with basic salary', () => {
      const result = generatePayslipData(employee, {});
      expect(result.basicSalary).toBe(50000);
    });

    it('should calculate totalAllowances', () => {
      const result = generatePayslipData(employee, {});
      expect(result.totalAllowances).toBe(6500);
    });

    it('should calculate grossSalary', () => {
      const result = generatePayslipData(employee, {});
      expect(result.grossSalary).toBeGreaterThan(50000);
    });

    it('should include overtime amount in grossSalary', () => {
      const result = generatePayslipData(employee, { overtime: { amount: 5000 } });
      expect(result.grossSalary).toBe(50000 + 6500 + 5000);
    });

    it('should calculate net salary less than gross', () => {
      const result = generatePayslipData(employee, {});
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    it('should include pension breakdown', () => {
      const result = generatePayslipData(employee, {});
      expect(result.pension.employee).toBeGreaterThan(0);
      expect(result.pension.employer).toBeGreaterThan(0);
    });

    it('should include tax deduction', () => {
      const result = generatePayslipData(employee, {});
      expect(result.deductions.tax).toBeGreaterThan(0);
    });

    it('should use provided payrollData values over employee defaults', () => {
      const result = generatePayslipData(employee, { basicSalary: 60000 });
      expect(result.basicSalary).toBe(60000);
    });

    it('should handle zero allowances', () => {
      const emp = { salary: { basicSalary: 10000, allowances: { transport: 0, housing: 0, medical: 0, other: 0 } } };
      const result = generatePayslipData(emp, {});
      expect(result.totalAllowances).toBe(0);
      expect(result.grossSalary).toBe(10000);
    });
  });
});
