const mongoose = require('mongoose');

describe('Department Model', () => {
  const Department = require('../../models/Department');

  it('should create valid department', () => {
    const dept = new Department({ name: 'IT', description: 'Information Technology' });
    expect(dept).toBeDefined();
    expect(dept.name).toBe('IT');
  });

  it('should require name', () => {
    const dept = new Department({});
    const err = dept.validateSync();
    expect(err.errors['name']).toBeDefined();
  });

  it('should trim name', () => {
    const dept = new Department({ name: '  Finance  ' });
    expect(dept.name).toBe('Finance');
  });

  it('should accept department head reference', () => {
    const dept = new Department({ name: 'HR', head: new mongoose.Types.ObjectId() });
    const err = dept.validateSync();
    expect(err).toBeUndefined();
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Department.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
