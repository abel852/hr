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
  it('the payroll page shows its management heading on load', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.title')).toBeInTheDocument();
  });

  it('a generate payroll button is available for running the current period', () => {
    render(<Payroll />);
    expect(screen.getByText('payroll.generatePayroll')).toBeInTheDocument();
  });
});
