import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ColorTokens, darkColors, highContrastColors, lightColors } from './palette';
import { fontSizes, fontWeights, radius, spacing } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark' | 'highContrast';

/** Persisted, non-PHI accessibility preferences. Safe for AsyncStorage. */
type ThemePreferences = {
  mode: ThemeMode;
  fontScale: number; // 1.0 .. 2.0 (spec 1.4)
};

const PREFS_KEY = '@carebridge/theme-prefs';
const DEFAULT_PREFS: ThemePreferences = { mode: 'system', fontScale: 1 };

export type Theme = {
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  fontWeights: typeof fontWeights;
  /** Font sizes already multiplied by the active fontScale. */
  fontSizes: typeof fontSizes;
  isDark: boolean;
};

type ThemeContextValue = Theme & {
  mode: ThemeMode;
  fontScale: number;
  setMode: (mode: ThemeMode) => void;
  setFontScale: (scale: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function scaleFontSizes(scale: number): typeof fontSizes {
  const clamped = Math.max(1, Math.min(2, scale));
  return Object.fromEntries(
    Object.entries(fontSizes).map(([key, value]) => [key, Math.round(value * clamped)]),
  ) as typeof fontSizes;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [prefs, setPrefs] = useState<ThemePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (active && raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: ThemePreferences) => {
    setPrefs(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setMode = useCallback((mode: ThemeMode) => persist({ ...prefs, mode }), [persist, prefs]);
  const setFontScale = useCallback(
    (fontScale: number) => persist({ ...prefs, fontScale }),
    [persist, prefs],
  );

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedMode: Exclude<ThemeMode, 'system'> =
      prefs.mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : prefs.mode;

    const colors =
      resolvedMode === 'highContrast'
        ? highContrastColors
        : resolvedMode === 'dark'
          ? darkColors
          : lightColors;

    return {
      colors,
      spacing,
      radius,
      fontWeights,
      fontSizes: scaleFontSizes(prefs.fontScale),
      isDark: resolvedMode !== 'light',
      mode: prefs.mode,
      fontScale: prefs.fontScale,
      setMode,
      setFontScale,
    };
  }, [prefs, systemScheme, setMode, setFontScale]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
