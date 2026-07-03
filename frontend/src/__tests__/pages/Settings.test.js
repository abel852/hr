import React from 'react';
import { render, screen } from '@testing-library/react';
import Settings from '../../pages/Settings';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

describe('Settings Page', () => {
  it('displays the settings page heading', () => {
    render(<Settings />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('shows the company settings configuration section', () => {
    render(<Settings />);
    expect(screen.getByText('settings.company')).toBeInTheDocument();
  });

  it('shows the holidays configuration section', () => {
    render(<Settings />);
    expect(screen.getByText('settings.holidays')).toBeInTheDocument();
  });
});
