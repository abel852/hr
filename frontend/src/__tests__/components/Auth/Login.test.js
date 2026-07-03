import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../../components/Auth/Login';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isAuthenticated: false,
    loading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Login Component', () => {
  it('displays a welcome-back heading on the login screen', () => {
    render(<Login />);
    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
  });

  it('renders an email address field for user input', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
  });

  it('renders a password field for user input', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('shows a login button to submit credentials', () => {
    render(<Login />);
    expect(screen.getByText('auth.loginButton')).toBeInTheDocument();
  });

  it('includes a remember-me checkbox on the form', () => {
    render(<Login />);
    expect(screen.getByText('auth.rememberMe')).toBeInTheDocument();
  });

  it('provides a forgot-password link for account recovery', () => {
    render(<Login />);
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });
});
