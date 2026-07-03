const mongoose = require('mongoose');

describe('Payroll Model', () => {
  const Payroll = require('../../models/Payroll');

  const validPayroll = {
    employee: new mongoose.Types.ObjectId(),
    payPeriod: { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31'), month: 1, year: 2024 },
    basicSalary: 50000,
    grossSalary: 55000,
    netSalary: 42000
  };

  it('should create valid payroll', () => {
    const p = new Payroll(validPayroll);
    expect(p).toBeDefined();
    expect(p.status).toBe('draft');
    expect(p.paymentMethod).toBe('bank_transfer');
  });

  it('should require employee', () => {
    const p = new Payroll({ ...validPayroll, employee: undefined });
    const err = p.validateSync();
    expect(err.errors['employee']).toBeDefined();
  });

  it('should require basicSalary', () => {
    const p = new Payroll({ ...validPayroll, basicSalary: undefined });
    const err = p.validateSync();
    expect(err.errors['basicSalary']).toBeDefined();
  });

  it('should require grossSalary', () => {
    const p = new Payroll({ ...validPayroll, grossSalary: undefined });
    const err = p.validateSync();
    expect(err.errors['grossSalary']).toBeDefined();
  });

  it('should require netSalary', () => {
    const p = new Payroll({ ...validPayroll, netSalary: undefined });
    const err = p.validateSync();
    expect(err.errors['netSalary']).toBeDefined();
  });

  it('should validate month range', () => {
    const p = new Payroll({ ...validPayroll, payPeriod: { ...validPayroll.payPeriod, month: 13 } });
    const err = p.validateSync();
    expect(err.errors['payPeriod.month']).toBeDefined();
  });

  it('should accept all status values', () => {
    for (const s of ['draft', 'approved', 'paid', 'cancelled']) {
      const p = new Payroll({ ...validPayroll, status: s });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept all payment methods', () => {
    for (const m of ['bank_transfer', 'cash', 'check']) {
      const p = new Payroll({ ...validPayroll, paymentMethod: m });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should calculate totalAllowances virtual', () => {
    const p = new Payroll({ ...validPayroll, allowances: { transport: 1000, housing: 2000, medical: 500, other: 300 } });
    expect(p.totalAllowances).toBe(3800);
  });

  it('should calculate totalDeductions virtual', () => {
    const p = new Payroll({ ...validPayroll, deductions: { pension: { employee: 3500 }, tax: 5000, other: 1000 } });
    expect(p.totalDeductions).toBe(9500);
  });

  it('should have compound unique index', () => {
    const indexes = Payroll.schema.indexes();
    const match = indexes.some(idx => idx[0].employee === 1 && idx[0]['payPeriod.year'] === 1 && idx[0]['payPeriod.month'] === 1 && idx[1].unique === true);
    expect(match).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Payroll.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
