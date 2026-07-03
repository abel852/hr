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

  it('should render when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Yes'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should render with custom confirm text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render with custom cancel text', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Back" />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});
