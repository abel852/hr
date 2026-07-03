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

  it('the selected message subject is shown at the top of the viewer', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('the full message body is displayed for reading', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText('Test message body')).toBeInTheDocument();
  });

  it('the sender name is visible so the user knows who wrote it', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('a close button lets the user exit the message viewer', () => {
    render(<MessageViewer {...defaultProps} />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
