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

  it('displays the dialog with title and confirmation message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('hides the dialog completely when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
  });

  it('fires the onConfirm callback when the user clicks Yes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Yes'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('fires the onCancel callback when the user clicks Cancel', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('supports a custom label for the confirm button', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('supports a custom label for the cancel button', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Back" />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});
