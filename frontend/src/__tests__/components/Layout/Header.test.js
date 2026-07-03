import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../../components/Layout/Header';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'en', changeLanguage: jest.fn() } }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin', email: 'admin@test.com' }, logout: jest.fn() }),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

describe('Header Component', () => {
  it('the header proudly shows the HR Management System title', () => {
    render(<Header />);
    expect(screen.getByText('HR Management System')).toBeInTheDocument();
  });

  it('at least one button is available in the header for user interaction', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('clicking the user button opens a dropdown with profile options', () => {
    render(<Header />);
    const userButtons = screen.getAllByRole('button');
    const lastButton = userButtons[userButtons.length - 1];
    fireEvent.click(lastButton);
    expect(screen.getByText('nav.profile')).toBeInTheDocument();
  });
});
