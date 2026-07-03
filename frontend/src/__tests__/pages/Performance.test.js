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
  it('displays the performance management page heading', () => {
    render(<Performance />);
    expect(screen.getByText('performance.title')).toBeInTheDocument();
  });

  it('shows a button to add a new performance evaluation', () => {
    render(<Performance />);
    expect(screen.getByText('performance.addEvaluation')).toBeInTheDocument();
  });
});
