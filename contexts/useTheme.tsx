import { ReactNode, createContext, useContext, useEffect } from 'react';

import { useLocalStorage } from '@/hooks';

export type Theme = 'light' | 'dark';

export interface ThemeContext {
  theme: Theme;
  toggleTheme: () => void;
}

export const Theme = createContext<ThemeContext>({
  theme: 'light',
  toggleTheme: () => {},
});

const getDefaultTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', getDefaultTheme, [
    v => (v === 'dark' ? v : 'light'),
    v => v,
  ]);

  // Only apply theme changes after initialization
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'));
  };

  return <Theme.Provider value={{ theme, toggleTheme }}>{children}</Theme.Provider>;
};

export const useTheme = (): ThemeContext => useContext(Theme);
