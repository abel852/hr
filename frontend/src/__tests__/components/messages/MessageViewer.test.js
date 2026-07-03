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

  it('displays the message subject line in the viewer', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('displays the message body content in the viewer', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test message body')).toBeInTheDocument();
  });

  it('shows the sender name within the message details', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('renders a close button to dismiss the message viewer', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
