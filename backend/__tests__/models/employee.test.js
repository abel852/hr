const mongoose = require('mongoose');

describe('Employee Model', () => {
  const Employee = require('../../models/Employee');

  const validEmployee = {
    employeeId: 'EMP001',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+251911111111',
      email: 'john@example.com',
      gender: 'male',
      dateOfBirth: new Date('1990-01-01'),
      emergencyContact: { name: 'Jane Doe', relationship: 'Spouse', phone: '+251911111112' }
    },
    employmentInfo: {
      department: 'IT',
      position: 'Developer',
      hireDate: new Date('2023-01-01'),
      contractType: 'permanent'
    },
    salary: { basicSalary: 50000 }
  };

  it('should create a valid employee', () => {
    const emp = new Employee(validEmployee);
    expect(emp).toBeDefined();
    expect(emp.employeeId).toBe('EMP001');
    expect(emp.employmentInfo.status).toBe('active');
  });

  it('should require employeeId', () => {
    const emp = new Employee({ ...validEmployee, employeeId: undefined });
    const err = emp.validateSync();
    expect(err.errors['employeeId']).toBeDefined();
  });

  it('should have fullName virtual', () => {
    const emp = new Employee(validEmployee);
    expect(emp.fullName).toBe('John Doe');
  });

  it('should require firstName', () => {
    const emp = new Employee({ ...validEmployee, personalInfo: { ...validEmployee.personalInfo, firstName: undefined } });
    const err = emp.validateSync();
    expect(err.errors['personalInfo.firstName']).toBeDefined();
  });

  it('should require lastName', () => {
    const emp = new Employee({ ...validEmployee, personalInfo: { ...validEmployee.personalInfo, lastName: undefined } });
    const err = emp.validateSync();
    expect(err.errors['personalInfo.lastName']).toBeDefined();
  });

  it('should require email', () => {
    const emp = new Employee({ ...validEmployee, personalInfo: { ...validEmployee.personalInfo, email: undefined } });
    const err = emp.validateSync();
    expect(err.errors['personalInfo.email']).toBeDefined();
  });

  it('should reject invalid gender', () => {
    const emp = new Employee({ ...validEmployee, personalInfo: { ...validEmployee.personalInfo, gender: 'unknown' } });
    const err = emp.validateSync();
    expect(err.errors['personalInfo.gender']).toBeDefined();
  });

  it('should accept all contract types', () => {
    for (const ct of ['permanent', 'contract', 'intern', 'part-time']) {
      const emp = new Employee({ ...validEmployee, employmentInfo: { ...validEmployee.employmentInfo, contractType: ct } });
      const err = emp.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should accept all status values', () => {
    for (const st of ['active', 'inactive', 'terminated', 'on-leave']) {
      const emp = new Employee({ ...validEmployee, employmentInfo: { ...validEmployee.employmentInfo, status: st } });
      const err = emp.validateSync();
      expect(err).toBeUndefined();
    }
  });

  it('should lowercase email in personalInfo', () => {
    const emp = new Employee({ ...validEmployee, personalInfo: { ...validEmployee.personalInfo, email: 'UPPER@TEST.COM' } });
    expect(emp.personalInfo.email).toBe('upper@test.com');
  });

  it('should have document type validation', () => {
    const emp = new Employee(validEmployee);
    emp.documents.push({ type: 'id', name: 'ID.pdf', filePath: '/uploads/id.pdf' });
    const err = emp.validateSync();
    expect(err).toBeUndefined();
  });

  it('should reject invalid document type', () => {
    const emp = new Employee(validEmployee);
    emp.documents.push({ type: 'invalid', name: 'test.pdf', filePath: '/test.pdf' });
    const err = emp.validateSync();
    expect(err).toBeDefined();
  });

  it('should have timestamps', () => {
    const emp = new Employee(validEmployee);
    const keys = Object.keys(Employee.schema.paths);
    expect(keys).toContain('createdAt');
    expect(keys).toContain('updatedAt');
  });
});
