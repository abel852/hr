import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '../../../components/Layout/Sidebar';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('react-router-dom', () => ({
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
  useLocation: () => ({ pathname: '/dashboard' }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' }, logout: jest.fn() }),
}));

describe('Sidebar Component', () => {
  it('should render navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
    expect(screen.getByText('nav.employees')).toBeInTheDocument();
    expect(screen.getByText('nav.attendance')).toBeInTheDocument();
    expect(screen.getByText('nav.leave')).toBeInTheDocument();
    expect(screen.getByText('nav.payroll')).toBeInTheDocument();
  });

  it('should have correct link paths', () => {
    render(<Sidebar />);
    expect(screen.getByText('nav.dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('nav.employees').closest('a')).toHaveAttribute('href', '/employees');
  });

  it('should render app logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('HR System')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    render(<Sidebar />);
    expect(screen.getByText('nav.logout')).toBeInTheDocument();
  });
});
