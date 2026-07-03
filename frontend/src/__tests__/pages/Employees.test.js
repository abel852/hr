import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Employees from '../../pages/Employees';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } }),
}));

jest.mock('../../api/client');

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Employees Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays a loading spinner while employees are being fetched', () => {
    render(<Employees />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows an empty-state message when no employees exist', async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });
  });

  it('shows the add-employee button for users with admin role', async () => {
    render(<Employees />);
    expect(await screen.findByText('employees.addEmployee')).toBeInTheDocument();
  });
});
