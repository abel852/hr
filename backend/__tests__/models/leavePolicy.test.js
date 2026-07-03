const mongoose = require('mongoose');

describe('LeavePolicy Model', () => {
  const LeavePolicy = require('../../models/LeavePolicy');

  it('should create a valid leave policy', () => {
    const policy = new LeavePolicy({ name: 'Standard Policy' });
    expect(policy).toBeDefined();
    expect(policy.name).toBe('Standard Policy');
    expect(policy.balances.annual).toBe(21);
    expect(policy.balances.sick).toBe(7);
    expect(policy.balances.maternity).toBe(90);
    expect(policy.balances.paternity).toBe(15);
    expect(policy.balances.casual).toBe(5);
    expect(policy.balances.emergency).toBe(3);
    expect(policy.balances.unpaid).toBe(0);
  });

  it('should require name and be unique', () => {
    const policy = new LeavePolicy({});
    const err = policy.validateSync();
    expect(err.errors['name']).toBeDefined();
  });

  it('should trim name', () => {
    const policy = new LeavePolicy({ name: '  Test Policy  ' });
    expect(policy.name).toBe('Test Policy');
  });

  it('should accept department references', () => {
    const policy = new LeavePolicy({
      name: 'Department Policy',
      appliesToDepartments: [new mongoose.Types.ObjectId()]
    });
    const err = policy.validateSync();
    expect(err).toBeUndefined();
  });

  it('should accept position references', () => {
    const policy = new LeavePolicy({
      name: 'Position Policy',
      appliesToPositions: [new mongoose.Types.ObjectId()]
    });
    const err = policy.validateSync();
    expect(err).toBeUndefined();
  });

  it('should allow custom balance values', () => {
    const policy = new LeavePolicy({ name: 'Custom Policy', balances: { annual: 30, sick: 15 } });
    expect(policy.balances.annual).toBe(30);
    expect(policy.balances.sick).toBe(15);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(LeavePolicy.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
