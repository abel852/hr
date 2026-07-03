const mongoose = require('mongoose');

describe('Work Model', () => {
  const Work = require('../../models/Work');

  it('should create valid work entry', () => {
    const w = new Work({
      employee: new mongoose.Types.ObjectId(),
      title: 'Complete project report',
      description: 'Final report for Q1'
    });
    expect(w).toBeDefined();
    expect(w.status).toBe('pending');
  });

  it('should require employee', () => {
    const w = new Work({ title: 'Task' });
    const err = w.validateSync();
    expect(err.errors['employee']).toBeDefined();
  });

  it('should require title', () => {
    const w = new Work({ employee: new mongoose.Types.ObjectId() });
    const err = w.validateSync();
    expect(err.errors['title']).toBeDefined();
  });

  it('should accept all status values', () => {
    for (const s of ['green', 'yellow', 'red', 'pending']) {
      const w = new Work({ employee: new mongoose.Types.ObjectId(), title: 'Task', status: s });
      const err = w.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should reject invalid status', () => {
    const w = new Work({ employee: new mongoose.Types.ObjectId(), title: 'Task', status: 'unknown' });
    const err = w.validateSync();
    expect(err.errors['status']).toBeDefined();
  });

  it('should accept attachments', () => {
    const w = new Work({
      employee: new mongoose.Types.ObjectId(),
      title: 'Task',
      attachments: [{ name: 'file.pdf', filePath: '/uploads/file.pdf', size: 1024 }]
    });
    const err = w.validateSync();
    expect(err).toBeUndefined();
  });

  it('should have default submittedAt', () => {
    const w = new Work({ employee: new mongoose.Types.ObjectId(), title: 'Task' });
    expect(w.submittedAt).toBeDefined();
    expect(w.submittedAt instanceof Date).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Work.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
