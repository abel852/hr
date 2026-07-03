import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../../components/Layout/Layout';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock('react-router-dom', () => ({
  Outlet: () => <div>Outlet Content</div>,
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' }, logout: jest.fn() }),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

jest.mock('../../../components/Layout/Header', () => () => <div>Header</div>);
jest.mock('../../../components/Layout/Sidebar', () => () => <div>Sidebar</div>);

describe('Layout Component', () => {
  it('includes the header component at the top of the layout', () => {
    render(<Layout />);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('includes the sidebar component for page navigation', () => {
    render(<Layout />);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders child route content through the Outlet', () => {
    render(<Layout />);
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });
});
