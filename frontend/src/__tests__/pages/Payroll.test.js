import React from 'react';
import { render, screen } from '@testing-library/react';
import Payroll from '../../pages/Payroll';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

describe('Payroll Page', () => {
  it('should render payroll title', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.title')).toBeInTheDocument();
  });

  it('should render generate payroll button', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.generatePayroll')).toBeInTheDocument();
  });
});
