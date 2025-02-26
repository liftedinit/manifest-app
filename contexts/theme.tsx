import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export interface ThemeContext {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Theme = createContext<ThemeContext>({
  theme: 'light',
  toggleTheme: () => {},
});

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  // Move localStorage and system preference check to client-side only
  return 'light'; // Default for initial render
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  // New effect to handle client-side initialization
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
    setIsInitialized(true);
  }, []);

  // Only apply theme changes after initialization
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  return <Theme.Provider value={{ theme, toggleTheme }}>{children}</Theme.Provider>;
};

export const useTheme = (): ThemeContext => useContext(Theme);
