export type Theme = 'light' | 'dark' | null;

export type ThemeContextValue = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};
