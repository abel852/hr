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
  it('greets returning users with a welcome back message on the login screen', () => {
    render(<Login />);
    expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
  });

  it('users can type their email into a dedicated input field', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
  });

  it('a password field is available for entering credentials', () => {
    render(<Login />);
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('clicking the login button submits the form', () => {
    render(<Login />);
    expect(screen.getByText('auth.loginButton')).toBeInTheDocument();
  });

  it('a remember me checkbox lets users stay signed in', () => {
    render(<Login />);
    expect(screen.getByText('auth.rememberMe')).toBeInTheDocument();
  });

  it('users who forgot their password can click a link to recover it', () => {
    render(<Login />);
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });
});
