import React from 'react';
import { render, screen } from '@testing-library/react';
import Performance from '../../pages/Performance';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

describe('Performance Page', () => {
  it('should render performance title', () => {
    render(<Performance />);
    expect(screen.getByText('performance.title')).toBeInTheDocument();
  });

  it('should render add evaluation button', () => {
    render(<Performance />);
    expect(screen.getByText('performance.addEvaluation')).toBeInTheDocument();
  });
});
