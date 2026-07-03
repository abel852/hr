const mongoose = require('mongoose');

describe('Position Model', () => {
  const Position = require('../../models/Position');

  it('should create valid position', () => {
    const pos = new Position({ title: 'Developer', department: new mongoose.Types.ObjectId() });
    expect(pos).toBeDefined();
    expect(pos.title).toBe('Developer');
  });

  it('should require title', () => {
    const pos = new Position({ department: new mongoose.Types.ObjectId() });
    const err = pos.validateSync();
    expect(err.errors['title']).toBeDefined();
  });

  it('should require department', () => {
    const pos = new Position({ title: 'Manager' });
    const err = pos.validateSync();
    expect(err.errors['department']).toBeDefined();
  });

  it('should trim title', () => {
    const pos = new Position({ title: '  Senior Dev  ', department: new mongoose.Types.ObjectId() });
    expect(pos.title).toBe('Senior Dev');
  });

  it('should accept responsibilities', () => {
    const pos = new Position({
      title: 'Engineer',
      department: new mongoose.Types.ObjectId(),
      responsibilities: ['Code', 'Review', 'Deploy']
    });
    const err = pos.validateSync();
    expect(err).toBeUndefined();
    expect(pos.responsibilities.length).toBe(3);
  });

  it('should have unique compound index', () => {
    const indexes = Position.schema.indexes();
    const match = indexes.some(idx => idx[0].title === 1 && idx[0].department === 1 && idx[1].unique === true);
    expect(match).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Position.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
