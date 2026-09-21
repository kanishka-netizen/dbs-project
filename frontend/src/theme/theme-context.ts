import { createContext } from 'react';

/** What the user asked for. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What is actually on screen once `system` has been resolved. */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Flips between light and dark, resolving `system` first. */
  toggleTheme: () => void;
}

export const THEME_STORAGE_KEY = 'dbs-theme';

export const ThemeContext = createContext<ThemeContextValue | null>(null);
