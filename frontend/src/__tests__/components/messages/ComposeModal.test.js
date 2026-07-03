import React from 'react';
import { render, screen } from '@testing-library/react';
import ComposeModal from '../../../components/messages/ComposeModal';

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: {} }),
}));

describe('ComposeModal Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSent: jest.fn(),
  };

  it('should render compose form', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Compose Message')).toBeInTheDocument();
  });

  it('should render To label', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('should render Subject label', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Subject')).toBeInTheDocument();
  });

  it('should render Send button', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should render Cancel button', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
