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
  it('should render settings title', () => {
    render(<Settings />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('should render company settings section', () => {
    render(<Settings />);
    expect(screen.getByText('settings.company')).toBeInTheDocument();
  });

  it('should render holidays section', () => {
    render(<Settings />);
    expect(screen.getByText('settings.holidays')).toBeInTheDocument();
  });
});
