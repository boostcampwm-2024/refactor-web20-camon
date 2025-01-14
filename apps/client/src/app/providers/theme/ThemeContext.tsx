import { createContext } from 'react';
import { Theme, ThemeContextValue } from './types';

const currentTheme = localStorage.getItem('theme') ?? null;

export const ThemeContext = createContext<ThemeContextValue>({
  theme: currentTheme as Theme,
  setTheme: () => null,
});
