import i18n from '../../i18n';

describe('i18n Configuration', () => {
  it('initializes the i18n instance on import', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('loads English translation resources for common, nav, and auth namespaces', () => {
    expect(i18n.getResource('en', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'auth')).toBeDefined();
  });

  it('loads Amharic translation resources for common, nav, and auth namespaces', () => {
    expect(i18n.getResource('am', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'auth')).toBeDefined();
  });

  it('defines English translations for the dashboard namespace with all expected keys', () => {
    const t = i18n.getResource('en', 'translation', 'dashboard');
    expect(t.title).toBe('Dashboard');
    expect(t.welcome).toBe('Welcome back');
    expect(t.totalEmployees).toBe('Total Employees');
    expect(t.presentToday).toBe('Present Today');
    expect(t.pendingLeaves).toBe('Pending Leaves');
    expect(t.monthlyPayroll).toBe('Monthly Payroll');
  });

  it('defines Amharic translations for the dashboard namespace', () => {
    const t = i18n.getResource('am', 'translation', 'dashboard');
    expect(t.title).toBe('ዳሽቦርድ');
    expect(t.totalEmployees).toBe('ጠቅላላ ሰራተኞች');
  });

  it('defines English translations for the employees namespace', () => {
    const en = i18n.getResource('en', 'translation', 'employees');
    expect(en.title).toBe('Employee Management');
    expect(en.addEmployee).toBe('Add Employee');
    expect(en.employeeDetails).toBe('Employee Details');
  });

  it('defines English translations for the attendance namespace', () => {
    const en = i18n.getResource('en', 'translation', 'attendance');
    expect(en.title).toBe('Attendance Management');
    expect(en.checkIn).toBe('Check In');
    expect(en.checkOut).toBe('Check Out');
  });

  it('defines English translations for the leave namespace', () => {
    const en = i18n.getResource('en', 'translation', 'leave');
    expect(en.title).toBe('Leave Management');
    expect(en.requestLeave).toBe('Request Leave');
  });

  it('defines English translations for the payroll namespace', () => {
    const en = i18n.getResource('en', 'translation', 'payroll');
    expect(en.title).toBe('Payroll Management');
    expect(en.grossSalary).toBe('Gross Salary');
    expect(en.netSalary).toBe('Net Salary');
  });

  it('defines English translations for the performance namespace', () => {
    const en = i18n.getResource('en', 'translation', 'performance');
    expect(en.title).toBe('Performance Management');
    expect(en.kpis).toBe('KPIs');
  });

  it('defines English translations for the settings namespace', () => {
    const en = i18n.getResource('en', 'translation', 'settings');
    expect(en.title).toBe('Settings');
  });

  it('defines English translations for the reports namespace', () => {
    const en = i18n.getResource('en', 'translation', 'reports');
    expect(en.title).toBe('Reports & Analytics');
  });

  it('falls back to English when a translation for an unsupported locale is requested', () => {
    const t = i18n.t('common.loading', { lng: 'fr' });
    expect(t).toBe('Loading...');
  });

  it('sets the default language to English', () => {
    expect(i18n.language).toBe('en');
  });
});
