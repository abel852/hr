import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Attendance from '../../pages/Attendance';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'employee' } }),
}));

jest.mock('../../api/client');

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Attendance Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render attendance title', async () => {
    render(<Attendance />);
    expect(await screen.findByText('attendance.title')).toBeInTheDocument();
  });

  it('should render check-in/check-out sections', async () => {
    render(<Attendance />);
    const checkInElements = await screen.findAllByText('attendance.checkIn');
    expect(checkInElements.length).toBe(2);
    const checkOutElements = screen.getAllByText('attendance.checkOut');
    expect(checkOutElements.length).toBe(2);
  });
});
