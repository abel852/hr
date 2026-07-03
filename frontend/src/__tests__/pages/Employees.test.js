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

  it('a spinner keeps users busy while the employee list loads', () => {
    render(<Employees />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('when there are no employees, a friendly empty-state message appears', async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText('No employees found')).toBeInTheDocument();
    });
  });

  it('admin users see an add employee button to create new records', async () => {
    render(<Employees />);
    expect(await screen.findByText('employees.addEmployee')).toBeInTheDocument();
  });
});
