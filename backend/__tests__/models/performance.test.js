const mongoose = require('mongoose');

describe('Performance Model', () => {
  const Performance = require('../../models/Performance');

  const validPerf = {
    employee: new mongoose.Types.ObjectId(),
    evaluator: new mongoose.Types.ObjectId(),
    period: { startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31'), year: 2024, quarter: 1 },
    rating: 'good',
    kpis: [
      { name: 'Task Completion', target: 100, actual: 95, weight: 50, score: 95 },
      { name: 'Quality', target: 100, actual: 90, weight: 50, score: 90 }
    ]
  };

  it('should create valid performance record', () => {
    const p = new Performance(validPerf);
    expect(p).toBeDefined();
    expect(p.status).toBe('draft');
  });

  it('should require employee', () => {
    const p = new Performance({ ...validPerf, employee: undefined });
    const err = p.validateSync();
    expect(err.errors['employee']).toBeDefined();
  });

  it('should require evaluator', () => {
    const p = new Performance({ ...validPerf, evaluator: undefined });
    const err = p.validateSync();
    expect(err.errors['evaluator']).toBeDefined();
  });

  it('should require rating', () => {
    const p = new Performance({ ...validPerf, rating: undefined });
    const err = p.validateSync();
    expect(err.errors['rating']).toBeDefined();
  });

  it('should accept all rating values', () => {
    for (const r of ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory']) {
      const p = new Performance({ ...validPerf, rating: r });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept valid quarter values', () => {
    for (const q of [1, 2, 3, 4]) {
      const p = new Performance({ ...validPerf, period: { ...validPerf.period, quarter: q } });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should reject invalid quarter', () => {
    const p = new Performance({ ...validPerf, period: { ...validPerf.period, quarter: 5 } });
    const err = p.validateSync();
    expect(err.errors['period.quarter']).toBeDefined();
  });

  it('should calculate score virtual correctly', () => {
    const p = new Performance(validPerf);
    expect(p.calculatedScore).toBe(93);
  });

  it('should return 0 calculatedScore when no KPIs', () => {
    const p = new Performance({ ...validPerf, kpis: [] });
    expect(p.calculatedScore).toBe(0);
  });

  it('should accept all status values', () => {
    for (const s of ['draft', 'submitted', 'reviewed', 'approved']) {
      const p = new Performance({ ...validPerf, status: s });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept goal status values', () => {
    for (const gs of ['not_started', 'in_progress', 'completed', 'cancelled']) {
      const p = new Performance(validPerf);
      p.goals.push({ goal: 'Test goal', targetDate: new Date(), status: gs });
      const err = p.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Performance.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
