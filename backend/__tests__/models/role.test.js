const mongoose = require('mongoose');

describe('Role Model', () => {
  const Role = require('../../models/Role');

  it('should create valid role', () => {
    const role = new Role({ name: 'admin', label: 'Administrator', permissions: ['read:all', 'write:all'] });
    expect(role).toBeDefined();
    expect(role.name).toBe('admin');
  });

  it('should lowercase name', () => {
    const role = new Role({ name: 'ADMIN', label: 'Admin' });
    expect(role.name).toBe('admin');
  });

  it('should trim name', () => {
    const role = new Role({ name: '  Admin  ', label: 'Admin' });
    expect(role.name).toBe('admin');
  });

  it('should only accept valid role names', () => {
    for (const n of ['admin', 'manager', 'employee']) {
      const role = new Role({ name: n, label: n });
      const err = role.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should reject invalid role name', () => {
    const role = new Role({ name: 'superadmin', label: 'Super Admin' });
    const err = role.validateSync();
    expect(err.errors['name']).toBeDefined();
  });

  it('should require name', () => {
    const role = new Role({ label: 'Admin' });
    const err = role.validateSync();
    expect(err.errors['name']).toBeDefined();
  });

  it('should require label', () => {
    const role = new Role({ name: 'admin' });
    const err = role.validateSync();
    expect(err.errors['label']).toBeDefined();
  });

  it('should have unique name index', () => {
    const indexes = Role.schema.indexes();
    const match = indexes.some(idx => idx[0].name === 1 && idx[1].unique === true);
    expect(match).toBe(true);
  });

  it('should have timestamps', () => {
    const keys = Object.keys(Role.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
