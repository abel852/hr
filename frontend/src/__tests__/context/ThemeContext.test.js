import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

const TestComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{isDark ? 'dark' : 'light'}</div>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light mode when no theme is saved in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('restores dark mode when the saved theme value is dark', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('switches from light to dark mode on toggle and persists the choice', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    act(() => {
      screen.getByTestId('toggle-btn').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('switches from dark to light mode on toggle and persists the choice', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    act(() => {
      screen.getByTestId('toggle-btn').click();
    });
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('applies or removes the dark class on the document root element', () => {
    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    act(() => {
      screen.getByTestId('toggle-btn').click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('throws an error when useTheme is consumed outside of ThemeProvider', () => {
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within a ThemeProvider');
  });
});
