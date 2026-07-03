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

  it('shows the compose message form with a heading', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Compose Message')).toBeInTheDocument();
  });

  it('renders a label for the recipient (To) field', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders a label for the message subject field', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Subject')).toBeInTheDocument();
  });

  it('provides a Send button to submit the message', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('provides a Cancel button to dismiss the composer', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
