const mongoose = require('mongoose');

describe('Leave Model', () => {
  const Leave = require('../../models/Leave');

  const validLeave = {
    employee: new mongoose.Types.ObjectId(),
    leaveType: 'annual',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-05'),
    totalDays: 5,
    reason: 'Vacation'
  };

  it('should create valid leave', () => {
    const leave = new Leave(validLeave);
    expect(leave).toBeDefined();
    expect(leave.status).toBe('pending');
  });

  it('should require employee', () => {
    const leave = new Leave({ ...validLeave, employee: undefined });
    const err = leave.validateSync();
    expect(err.errors['employee']).toBeDefined();
  });

  it('should require leaveType', () => {
    const leave = new Leave({ ...validLeave, leaveType: undefined });
    const err = leave.validateSync();
    expect(err.errors['leaveType']).toBeDefined();
  });

  it('should accept all leave types', () => {
    for (const t of ['annual', 'sick', 'maternity', 'paternity', 'casual', 'emergency', 'unpaid']) {
      const leave = new Leave({ ...validLeave, leaveType: t });
      const err = leave.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should reject invalid leaveType', () => {
    const leave = new Leave({ ...validLeave, leaveType: 'sabbatical' });
    const err = leave.validateSync();
    expect(err.errors['leaveType']).toBeDefined();
  });

  it('should require reason', () => {
    const leave = new Leave({ ...validLeave, reason: undefined });
    const err = leave.validateSync();
    expect(err.errors['reason']).toBeDefined();
  });

  it('should accept all status values', () => {
    for (const s of ['pending', 'approved', 'rejected', 'cancelled']) {
      const leave = new Leave({ ...validLeave, status: s });
      const err = leave.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should calculate duration virtual for full days', () => {
    const leave = new Leave(validLeave);
    expect(leave.duration).toBe(5);
  });

  it('should return 0.5 for half-day leave duration', () => {
    const leave = new Leave({ ...validLeave, isHalfDay: true, halfDayType: 'first-half' });
    expect(leave.duration).toBe(0.5);
  });

  it('should accept halfDayType values', () => {
    for (const t of ['first-half', 'second-half']) {
      const leave = new Leave({ ...validLeave, isHalfDay: true, halfDayType: t });
      const err = leave.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Leave.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
