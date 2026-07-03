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
  it('displays the payroll management page heading', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.title')).toBeInTheDocument();
  });

  it('shows a button to generate payroll for the current period', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.generatePayroll')).toBeInTheDocument();
  });
});
