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
  it('displays the application title in the header bar', () => {
    render(<Header />);
    expect(screen.getByText('HR Management System')).toBeInTheDocument();
  });

  it('renders interactive buttons including the theme toggle', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('reveals the profile dropdown when the user menu button is clicked', () => {
    render(<Header />);
    const userButtons = screen.getAllByRole('button');
    const lastButton = userButtons[userButtons.length - 1];
    fireEvent.click(lastButton);
    expect(screen.getByText('nav.profile')).toBeInTheDocument();
  });
});
