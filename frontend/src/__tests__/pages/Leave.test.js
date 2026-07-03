import React from 'react';
import { render, screen } from '@testing-library/react';
import Leave from '../../pages/Leave';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'employee' } }),
}));

describe('Leave Page', () => {
  it('the leave page heading is visible on load', () => {
    render(<Leave />);
    expect(screen.getByText('leave.title')).toBeInTheDocument();
  });

  it('employees can request time off via a dedicated button', () => {
    render(<Leave />);
    expect(screen.getByText('leave.requestLeave')).toBeInTheDocument();
  });
});
