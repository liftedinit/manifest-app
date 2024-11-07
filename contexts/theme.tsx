import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';

export interface ThemeContext {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Theme = createContext<ThemeContext>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.classList.add('light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    switch (theme) {
      case 'light':
        document.documentElement.classList.remove('dark');
        break;
      case 'dark':
        document.documentElement.classList.add('dark');
        break;
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('light');
        break;
    }
  }, [theme]);

  return (
    <Theme.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </Theme.Provider>
  );
};

export const useTheme = (): ThemeContext => useContext(Theme);
