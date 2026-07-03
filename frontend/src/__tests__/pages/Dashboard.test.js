import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { employeeId: { personalInfo: { firstName: 'John' } }, role: 'admin' }
  }),
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div>Line</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>Grid</div>,
  Tooltip: () => <div>Tooltip</div>,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: ({ children }) => <div>{children}</div>,
  Cell: () => <div>Cell</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('a spinner appears while the dashboard fetches its data', () => {
    render(<Dashboard />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('once loaded, the dashboard greets the user with a welcome message', () => {
    render(<Dashboard />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText(/dashboard.welcome/)).toBeInTheDocument();
  });

  it('four key metric cards — total employees, present today, pending leaves, and payroll — are rendered', () => {
    render(<Dashboard />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('dashboard.totalEmployees')).toBeInTheDocument();
    expect(screen.getByText('dashboard.presentToday')).toBeInTheDocument();
    expect(screen.getByText('dashboard.pendingLeaves')).toBeInTheDocument();
    expect(screen.getByText('dashboard.monthlyPayroll')).toBeInTheDocument();
  });

  it('attendance overview and leave request charts show up after loading', () => {
    render(<Dashboard />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('dashboard.attendanceOverview')).toBeInTheDocument();
    expect(screen.getByText('dashboard.leaveRequests')).toBeInTheDocument();
  });

  it('a recent activity feed is displayed once the dashboard is ready', () => {
    render(<Dashboard />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('dashboard.recentActivities')).toBeInTheDocument();
  });

  it('upcoming birthdays are listed in their own section after loading', () => {
    render(<Dashboard />);
    act(() => { jest.advanceTimersByTime(1000); });
    expect(screen.getByText('dashboard.upcomingBirthdays')).toBeInTheDocument();
  });
});
