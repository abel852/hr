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
  it('should render welcome back title', () => {
    render(<Login />);
    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
  });

  it('should render password input', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<Login />);
    expect(screen.getByText('auth.loginButton')).toBeInTheDocument();
  });

  it('should render remember me checkbox', () => {
    render(<Login />);
    expect(screen.getByText('auth.rememberMe')).toBeInTheDocument();
  });

  it('should render forgot password link', () => {
    render(<Login />);
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });
});
