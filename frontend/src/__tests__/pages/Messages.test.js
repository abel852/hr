import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Messages from '../../pages/Messages';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'employee', _id: 'user1' } }),
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { messages: [] } }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
}));

jest.mock('../../components/common/ConfirmDialog', () => () => null);
jest.mock('../../components/messages/ComposeModal', () => () => null);
jest.mock('../../components/messages/MessageViewer', () => () => null);

describe('Messages Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render messages title', async () => {
    render(<Messages />);
    expect(await screen.findByText('Messages')).toBeInTheDocument();
  });

  it('should render compose button', async () => {
    render(<Messages />);
    expect(await screen.findByText('Compose')).toBeInTheDocument();
  });

  it('should render inbox tab', async () => {
    render(<Messages />);
    expect(await screen.findByText('Inbox')).toBeInTheDocument();
  });
});
