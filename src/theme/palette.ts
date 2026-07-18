/**
 * Color palettes.
 *
 * All foreground/background pairings are chosen to meet WCAG 2.1 AA contrast
 * (>= 4.5:1 for body text, >= 3:1 for large text/UI components). A dedicated
 * high-contrast palette is provided for users who enable it (spec 1.4).
 */
export type GradientTokens = {
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  heroStart: string;
  heroMid: string;
  heroEnd: string;
  cardStart: string;
  cardEnd: string;
};

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  onDanger: string;
  info: string;
  focusRing: string;
  overlay: string;
  shadow: string;
  gradient: GradientTokens;
};

export const lightColors: ColorTokens = {
  background: '#EEF4FB',
  surface: '#FFFFFF',
  surfaceAlt: '#E8F0FA',
  border: '#C5D4E8',
  text: '#0C1B33',
  textMuted: '#4A6278',
  primary: '#0A6FD4',
  primaryMuted: '#D6EBFF',
  accent: '#14B8A6',
  onPrimary: '#FFFFFF',
  success: '#0F7A4A',
  warning: '#9A6700',
  danger: '#C41E12',
  onDanger: '#FFFFFF',
  info: '#0A6FD4',
  focusRing: '#0A6FD4',
  overlay: 'rgba(12, 27, 51, 0.45)',
  shadow: 'rgba(10, 111, 212, 0.12)',
  gradient: {
    backgroundStart: '#EEF4FB',
    backgroundMid: '#E3EDF9',
    backgroundEnd: '#D9E8F7',
    heroStart: '#0A6FD4',
    heroMid: '#0E8FA8',
    heroEnd: '#14B8A6',
    cardStart: '#FFFFFF',
    cardEnd: '#F4F9FF',
  },
};

export const darkColors: ColorTokens = {
  background: '#070E1A',
  surface: '#0F1A2E',
  surfaceAlt: '#162238',
  border: '#2A3F5C',
  text: '#F0F6FC',
  textMuted: '#94A9C4',
  primary: '#5BB0FF',
  primaryMuted: '#1A3050',
  accent: '#2DD4BF',
  onPrimary: '#070E1A',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FCA5A5',
  onDanger: '#070E1A',
  info: '#5BB0FF',
  focusRing: '#93C5FD',
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(91, 176, 255, 0.15)',
  gradient: {
    backgroundStart: '#070E1A',
    backgroundMid: '#0B1528',
    backgroundEnd: '#0F1F38',
    heroStart: '#0A4A8A',
    heroMid: '#0E6B7A',
    heroEnd: '#0F766E',
    cardStart: '#0F1A2E',
    cardEnd: '#132038',
  },
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
  primaryMuted: '#332800',
  accent: '#40C4FF',
  onPrimary: '#000000',
  success: '#00E676',
  warning: '#FFD400',
  danger: '#FF5252',
  onDanger: '#000000',
  info: '#40C4FF',
  focusRing: '#FFD400',
  overlay: 'rgba(0, 0, 0, 0.85)',
  shadow: 'rgba(255, 255, 255, 0.1)',
  gradient: {
    backgroundStart: '#000000',
    backgroundMid: '#000000',
    backgroundEnd: '#0A0A0A',
    heroStart: '#1A1A00',
    heroMid: '#000000',
    heroEnd: '#001A1A',
    cardStart: '#000000',
    cardEnd: '#0A0A0A',
  },
};
