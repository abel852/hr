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
  it('the performance page heading is displayed on load', () => {
    render(<Performance />);
    expect(screen.getByText('performance.title')).toBeInTheDocument();
  });

  it('an add evaluation button lets admins create new performance reviews', () => {
    render(<Performance />);
    expect(screen.getByText('performance.addEvaluation')).toBeInTheDocument();
  });
});
