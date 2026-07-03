import React from 'react';
import { render, screen } from '@testing-library/react';
import Reports from '../../pages/Reports';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

describe('Reports Page', () => {
  it('the reports and analytics heading is visible on the page', () => {
    render(<Reports />);
    expect(screen.getByText('reports.title')).toBeInTheDocument();
  });
});
