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
  it('the settings page heading appears when the page loads', () => {
    render(<Settings />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('a company settings section lets admins configure organization details', () => {
    render(<Settings />);
    expect(screen.getByText('settings.company')).toBeInTheDocument();
  });

  it('a holidays section is available for managing time-off schedules', () => {
    render(<Settings />);
    expect(screen.getByText('settings.holidays')).toBeInTheDocument();
  });
});
