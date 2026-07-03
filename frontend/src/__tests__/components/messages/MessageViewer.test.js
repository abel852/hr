import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageViewer from '../../../components/messages/MessageViewer';

describe('MessageViewer Component', () => {
  const defaultProps = {
    message: {
      _id: 'm1',
      subject: 'Test Subject',
      body: 'Test message body',
      senderName: 'John Doe',
      senderRole: 'admin',
      recipientName: 'Jane Smith',
      recipientRole: 'employee',
      createdAt: new Date().toISOString(),
    },
    onClose: jest.fn(),
    onReply: jest.fn(),
  };

  it('should render message subject', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('should render message body', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test message body')).toBeInTheDocument();
  });

  it('should render sender name', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
