const mongoose = require('mongoose');

describe('User Model', () => {
  const User = require('../../models/User');

  it('should create a valid user schema', () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'employee'
    });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('employee');
    expect(user.isActive).toBe(true);
    expect(user.language).toBe('en');
  });

  it('should lowercase email', () => {
    const user = new User({ email: 'TEST@EXAMPLE.COM', password: 'password123' });
    expect(user.email).toBe('test@example.com');
  });

  it('should trim email', () => {
    const user = new User({ email: '  test@example.com  ', password: 'password123' });
    expect(user.email).toBe('test@example.com');
  });

  it('should reject invalid role', () => {
    const user = new User({ email: 'test@test.com', password: 'password123', role: 'superadmin' });
    const err = user.validateSync();
    expect(err.errors['role']).toBeDefined();
  });

  it('should accept valid roles', () => {
    for (const role of ['admin', 'manager', 'employee']) {
      const user = new User({ email: `test-${role}@test.com`, password: 'password123', role });
      const err = user.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should require email', () => {
    const user = new User({ password: 'password123' });
    const err = user.validateSync();
    expect(err.errors['email']).toBeDefined();
  });

  it('should require password with minlength', () => {
    const user = new User({ email: 'test@test.com', password: '12345' });
    const err = user.validateSync();
    expect(err.errors['password']).toBeDefined();
  });

  it('should have comparePassword method', () => {
    const user = new User({ email: 'test@test.com', password: 'password123' });
    expect(typeof user.comparePassword).toBe('function');
  });

  it('should have timestamps', () => {
    const user = new User({ email: 'test@test.com', password: 'password123' });
    const schemaKeys = Object.keys(User.schema.paths);
    expect(schemaKeys).toContain('createdAt');
    expect(schemaKeys).toContain('updatedAt');
  });

  it('should accept language en and am', () => {
    for (const lang of ['en', 'am']) {
      const user = new User({ email: `test-${lang}@test.com`, password: 'password123', language: lang });
      const err = user.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should default to employee role', () => {
    const user = new User({ email: 'test@test.com', password: 'password123' });
    expect(user.role).toBe('employee');
  });
});
