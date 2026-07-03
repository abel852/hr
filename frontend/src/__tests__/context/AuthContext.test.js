import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

jest.mock('../../api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: { request: { handlers: [] } },
  defaults: { baseURL: 'http://localhost:5000/api' },
}));

const client = require('../../api/client');

const TestComponent = () => {
  const { isAuthenticated, user, loading, error, login, logout, clearError } = useAuth();
  return (
    <div>
      <div data-testid="auth">{isAuthenticated ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button data-testid="login-btn" onClick={() => login('a@b.com', 'pass')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
      <button data-testid="clear-btn" onClick={clearError}>Clear</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with logged-out state and no user data', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth').textContent).toBe('logged-out');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('restores an active session when a valid token exists in localStorage', async () => {
    localStorage.setItem('token', 'existing-token');
    client.get.mockResolvedValue({ data: { email: 'test@test.com', role: 'admin' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-in');
    });
  });

  it('clears the session when the stored token fails authentication', async () => {
    localStorage.setItem('token', 'bad-token');
    client.get.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-out');
    });
  });

  it('authenticates the user and stores the session on valid credentials', async () => {
    client.post.mockResolvedValue({ data: { token: 'new-token', user: { email: 'a@b.com', role: 'employee' } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-in');
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });
  });

  it('reports an error message when login credentials are rejected', async () => {
    client.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      expect(screen.getByTestId('auth').textContent).toBe('logged-out');
    });
  });

  it('removes the token from localStorage and resets to logged-out state on logout', async () => {
    localStorage.setItem('token', 'some-token');
    client.get.mockResolvedValue({ data: { email: 'test@test.com', role: 'admin' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth').textContent).toBe('logged-in');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('auth').textContent).toBe('logged-out');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('resets the error state to null when clearError is called', async () => {
    client.post.mockRejectedValue({ response: { data: { message: 'Error' } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Error');
    });

    await act(async () => {
      screen.getByTestId('clear-btn').click();
    });

    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });

  it('throws an error when useAuth is consumed outside of AuthProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
