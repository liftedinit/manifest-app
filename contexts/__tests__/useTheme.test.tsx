import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, jest, mock, test } from 'bun:test';
import React from 'react';

import { ThemeProvider, useTheme } from '@/contexts';

function TestComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p data-testid="theme">{theme}</p>
      <button data-testid="toggle-btn" onClick={() => toggleTheme()}>
        Toggle Theme
      </button>
    </div>
  );
}

describe('useTheme', () => {
  afterAll(cleanup);

  test('should toggle theme', async () => {
    const { container } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const themeEl = screen.getByTestId('theme');
    const toggleBtn = screen.getByTestId('toggle-btn');

    expect(themeEl.textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(toggleBtn);
    await waitFor(() => expect(themeEl.textContent).toBe('dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(toggleBtn);
    await waitFor(() => expect(themeEl.textContent).toBe('light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
