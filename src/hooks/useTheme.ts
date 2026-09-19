import { useCallback, useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../services';
import type { ThemeName } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(loadTheme);
  const [themeSaveFailed, setThemeSaveFailed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const color = theme === 'dark' ? '#0b1614' : '#f3f6f5';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: ThemeName = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setThemeSaveFailed(!saveTheme(next));
    return next;
  }, [theme]);

  return { theme, themeSaveFailed, toggleTheme };
}
