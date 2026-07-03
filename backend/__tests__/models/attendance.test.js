const mongoose = require('mongoose');

describe('Attendance Model', () => {
  const Attendance = require('../../models/Attendance');

  const validAttendance = {
    employee: new mongoose.Types.ObjectId(),
    date: new Date('2024-01-15'),
    checkIn: { time: new Date('2024-01-15T08:00:00'), method: 'manual' },
    checkOut: { time: new Date('2024-01-15T17:00:00'), method: 'manual' }
  };

  it('should create valid attendance', () => {
    const att = new Attendance(validAttendance);
    expect(att).toBeDefined();
    expect(att.status).toBe('present');
    expect(att.shift).toBe('morning');
  });

  it('should require employee reference', () => {
    const att = new Attendance({ ...validAttendance, employee: undefined });
    const err = att.validateSync();
    expect(err.errors['employee']).toBeDefined();
  });

  it('should require date', () => {
    const att = new Attendance({ ...validAttendance, date: undefined });
    const err = att.validateSync();
    expect(err.errors['date']).toBeDefined();
  });

  it('should have calculatedHours virtual', () => {
    const att = new Attendance(validAttendance);
    expect(typeof att.calculatedHours).toBe('number');
  });

  it('should accept overtime value', () => {
    const att = new Attendance({ ...validAttendance, overtime: 2.5 });
    expect(att.overtime).toBe(2.5);
  });

  it('should accept all status values', () => {
    for (const s of ['present', 'absent', 'late', 'half-day', 'on-leave']) {
      const att = new Attendance({ ...validAttendance, status: s });
      const err = att.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should reject invalid status', () => {
    const att = new Attendance({ ...validAttendance, status: 'unknown' });
    const err = att.validateSync();
    expect(err.errors['status']).toBeDefined();
  });

  it('should accept all check methods', () => {
    for (const m of ['manual', 'biometric', 'mobile']) {
      const att = new Attendance({ ...validAttendance, checkIn: { ...validAttendance.checkIn, method: m } });
      const err = att.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept all shift types', () => {
    for (const s of ['morning', 'afternoon', 'night']) {
      const att = new Attendance({ ...validAttendance, shift: s });
      const err = att.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should have compound unique index on employee+date', () => {
    const indexes = Attendance.schema.indexes();
    const hasCompound = indexes.some(idx => 
      idx[0].employee === 1 && idx[0].date === 1 && idx[1].unique === true
    );
    expect(hasCompound).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Attendance.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
