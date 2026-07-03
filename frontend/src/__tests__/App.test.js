import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('react-i18next', () => ({
  I18nextProvider: ({ children }) => children,
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../context/AuthContext', () => {
  const MockAuthProvider = ({ children }) => children;
  const useAuth = () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
  });
  return { AuthProvider: MockAuthProvider, useAuth };
});

jest.mock('../context/ThemeContext', () => {
  const MockThemeProvider = ({ children }) => children;
  const useTheme = () => ({ isDark: false, toggleTheme: jest.fn() });
  return { ThemeProvider: MockThemeProvider, useTheme };
});

jest.mock('../i18n', () => ({
  language: 'en',
  changeLanguage: jest.fn(),
}));

describe('App Component', () => {
  it('renders the root .App wrapper without errors', () => {
    render(<App />);
    expect(document.querySelector('.App')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to the login page', () => {
    render(<App />);
    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
  });
});
