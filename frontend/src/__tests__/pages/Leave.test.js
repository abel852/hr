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
  it('displays the leave management page heading', () => {
    render(<Leave />);
    expect(screen.getByText('leave.title')).toBeInTheDocument();
  });

  it('shows a request-leave button for employees', () => {
    render(<Leave />);
    expect(screen.getByText('leave.requestLeave')).toBeInTheDocument();
  });
});
