import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ResolvedTheme,
  type ThemePreference,
} from './theme-context';

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* storage can be unavailable in private mode */
  }

  // Defaulting to `system` is the least surprising choice: a first-time
  // visitor gets whatever their operating system is already using.
  return 'system';
}

function readSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Owned by Team 2 (TripleX). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(readStoredPreference);

  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>(readSystemTheme);

  // Keep `system` genuinely live: if the OS switches to dark at sunset, the
  // app follows without a reload.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, []);

  const theme: ResolvedTheme =
    preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* storage may be unavailable in private mode — the theme still applies */
    }
  }, [theme, preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferenceState((current) => {
      const resolved = current === 'system' ? readSystemTheme() : current;

      return resolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggleTheme }),
    [preference, theme, setPreference, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
