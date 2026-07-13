/**
 * Color palettes.
 *
 * All foreground/background pairings are chosen to meet WCAG 2.1 AA contrast
 * (>= 4.5:1 for body text, >= 3:1 for large text/UI components). A dedicated
 * high-contrast palette is provided for users who enable it (spec 1.4).
 */
export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  onDanger: string;
  info: string;
  focusRing: string;
  overlay: string;
};

export const lightColors: ColorTokens = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F7',
  border: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#475569',
  primary: '#0B6BCB',
  onPrimary: '#FFFFFF',
  success: '#146C43',
  warning: '#8A5A00',
  danger: '#B42318',
  onDanger: '#FFFFFF',
  info: '#0B6BCB',
  focusRing: '#0B6BCB',
  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const darkColors: ColorTokens = {
  background: '#0B1120',
  surface: '#111827',
  surfaceAlt: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textMuted: '#CBD5E1',
  primary: '#60A5FA',
  onPrimary: '#0B1120',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FCA5A5',
  onDanger: '#0B1120',
  info: '#60A5FA',
  focusRing: '#93C5FD',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** Maximum-contrast palette (black/white/high-saturation) for accessibility. */
export const highContrastColors: ColorTokens = {
  background: '#000000',
  surface: '#000000',
  surfaceAlt: '#0A0A0A',
  border: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: '#F1F1F1',
  primary: '#FFD400',
  onPrimary: '#000000',
  success: '#00E676',
  warning: '#FFD400',
  danger: '#FF5252',
  onDanger: '#000000',
  info: '#40C4FF',
  focusRing: '#FFD400',
  overlay: 'rgba(0, 0, 0, 0.85)',
};
