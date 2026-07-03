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
  it('displays the reports and analytics page heading', () => {
    render(<Reports />);
    expect(screen.getByText('reports.title')).toBeInTheDocument();
  });
});
