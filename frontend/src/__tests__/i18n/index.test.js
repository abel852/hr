import i18n from '../../i18n';

describe('i18n Configuration', () => {
  it('should be initialized', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('should have English translations', () => {
    expect(i18n.getResource('en', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'auth')).toBeDefined();
  });

  it('should have Amharic translations', () => {
    expect(i18n.getResource('am', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'auth')).toBeDefined();
  });

  it('should have dashboard translations in English', () => {
    const t = i18n.getResource('en', 'translation', 'dashboard');
    expect(t.title).toBe('Dashboard');
    expect(t.welcome).toBe('Welcome back');
    expect(t.totalEmployees).toBe('Total Employees');
    expect(t.presentToday).toBe('Present Today');
    expect(t.pendingLeaves).toBe('Pending Leaves');
    expect(t.monthlyPayroll).toBe('Monthly Payroll');
  });

  it('should have dashboard translations in Amharic', () => {
    const t = i18n.getResource('am', 'translation', 'dashboard');
    expect(t.title).toBe('ዳሽቦርድ');
    expect(t.totalEmployees).toBe('ጠቅላላ ሰራተኞች');
  });

  it('should have employee page translations', () => {
    const en = i18n.getResource('en', 'translation', 'employees');
    expect(en.title).toBe('Employee Management');
    expect(en.addEmployee).toBe('Add Employee');
    expect(en.employeeDetails).toBe('Employee Details');
  });

  it('should have attendance page translations', () => {
    const en = i18n.getResource('en', 'translation', 'attendance');
    expect(en.title).toBe('Attendance Management');
    expect(en.checkIn).toBe('Check In');
    expect(en.checkOut).toBe('Check Out');
  });

  it('should have leave page translations', () => {
    const en = i18n.getResource('en', 'translation', 'leave');
    expect(en.title).toBe('Leave Management');
    expect(en.requestLeave).toBe('Request Leave');
  });

  it('should have payroll translations', () => {
    const en = i18n.getResource('en', 'translation', 'payroll');
    expect(en.title).toBe('Payroll Management');
    expect(en.grossSalary).toBe('Gross Salary');
    expect(en.netSalary).toBe('Net Salary');
  });

  it('should have performance translations', () => {
    const en = i18n.getResource('en', 'translation', 'performance');
    expect(en.title).toBe('Performance Management');
    expect(en.kpis).toBe('KPIs');
  });

  it('should have settings translations', () => {
    const en = i18n.getResource('en', 'translation', 'settings');
    expect(en.title).toBe('Settings');
  });

  it('should have reports translations', () => {
    const en = i18n.getResource('en', 'translation', 'reports');
    expect(en.title).toBe('Reports & Analytics');
  });

  it('should fall back to English', () => {
    const t = i18n.t('common.loading', { lng: 'fr' });
    expect(t).toBe('Loading...');
  });

  it('should have default language as English', () => {
    expect(i18n.language).toBe('en');
  });
});
