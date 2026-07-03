import i18n from '../../i18n';

describe('i18n Configuration', () => {
  it('the i18n library fires up as soon as the module is imported', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('English translations are ready for common UI, navigation, and auth pages', () => {
    expect(i18n.getResource('en', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('en', 'translation', 'auth')).toBeDefined();
  });

  it('Amharic translations are ready for common UI, navigation, and auth pages', () => {
    expect(i18n.getResource('am', 'translation', 'common')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'nav')).toBeDefined();
    expect(i18n.getResource('am', 'translation', 'auth')).toBeDefined();
  });

  it('the dashboard section has all its English labels mapped out', () => {
    const t = i18n.getResource('en', 'translation', 'dashboard');
    expect(t.title).toBe('Dashboard');
    expect(t.welcome).toBe('Welcome back');
    expect(t.totalEmployees).toBe('Total Employees');
    expect(t.presentToday).toBe('Present Today');
    expect(t.pendingLeaves).toBe('Pending Leaves');
    expect(t.monthlyPayroll).toBe('Monthly Payroll');
  });

  it('the dashboard section has Amharic translations too', () => {
    const t = i18n.getResource('am', 'translation', 'dashboard');
    expect(t.title).toBe('ዳሽቦርድ');
    expect(t.totalEmployees).toBe('ጠቅላላ ሰራተኞች');
  });

  it('employee management labels are available in English', () => {
    const en = i18n.getResource('en', 'translation', 'employees');
    expect(en.title).toBe('Employee Management');
    expect(en.addEmployee).toBe('Add Employee');
    expect(en.employeeDetails).toBe('Employee Details');
  });

  it('attendance tracking labels are available in English', () => {
    const en = i18n.getResource('en', 'translation', 'attendance');
    expect(en.title).toBe('Attendance Management');
    expect(en.checkIn).toBe('Check In');
    expect(en.checkOut).toBe('Check Out');
  });

  it('leave management labels are available in English', () => {
    const en = i18n.getResource('en', 'translation', 'leave');
    expect(en.title).toBe('Leave Management');
    expect(en.requestLeave).toBe('Request Leave');
  });

  it('payroll labels including gross and net salary are in English', () => {
    const en = i18n.getResource('en', 'translation', 'payroll');
    expect(en.title).toBe('Payroll Management');
    expect(en.grossSalary).toBe('Gross Salary');
    expect(en.netSalary).toBe('Net Salary');
  });

  it('performance management labels including KPIs are in English', () => {
    const en = i18n.getResource('en', 'translation', 'performance');
    expect(en.title).toBe('Performance Management');
    expect(en.kpis).toBe('KPIs');
  });

  it('settings labels are available in English', () => {
    const en = i18n.getResource('en', 'translation', 'settings');
    expect(en.title).toBe('Settings');
  });

  it('reports and analytics labels are in English', () => {
    const en = i18n.getResource('en', 'translation', 'reports');
    expect(en.title).toBe('Reports & Analytics');
  });

  it('requesting a French string falls back gracefully to English', () => {
    const t = i18n.t('common.loading', { lng: 'fr' });
    expect(t).toBe('Loading...');
  });

  it('English is the default language when the app loads', () => {
    expect(i18n.language).toBe('en');
  });
});
