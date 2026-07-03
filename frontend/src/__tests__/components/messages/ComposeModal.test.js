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

  it('the compose modal opens with a clear Compose Message heading', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Compose Message')).toBeInTheDocument();
  });

  it('a To field lets the user specify the message recipient', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('a Subject field is available for the message title', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Subject')).toBeInTheDocument();
  });

  it('a Send button lets the user dispatch the message', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('a Cancel button lets the user back out of composing', () => {
    render(<ComposeModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
