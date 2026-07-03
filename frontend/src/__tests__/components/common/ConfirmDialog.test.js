import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Employee',
    message: 'Are you sure you want to delete this employee?',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('when open, the dialog shows its title and message for the user to review', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('closing the dialog removes it entirely from the page', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
  });

  it('hitting Yes triggers the confirm action', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Yes'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('hitting Cancel triggers the cancel action', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('the confirm button text can be customized per dialog', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('the cancel button text can be customized per dialog', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Back" />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});
