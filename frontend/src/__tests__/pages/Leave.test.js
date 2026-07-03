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
  it('should render leave title', () => {
    render(<Leave />);
    expect(screen.getByText('leave.title')).toBeInTheDocument();
  });

  it('should render request leave button', () => {
    render(<Leave />);
    expect(screen.getByText('leave.requestLeave')).toBeInTheDocument();
  });
});
