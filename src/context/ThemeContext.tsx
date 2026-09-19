import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '../hooks';
import type { ThemeName } from '../types';

interface ThemeContextValue {
  theme: ThemeName;
  themeSaveFailed: boolean;
  toggleTheme: () => ThemeName;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useThemeContext must be used inside ThemeProvider');
  return value;
}
