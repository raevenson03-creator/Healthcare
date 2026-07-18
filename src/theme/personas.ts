import { ColorTokens } from './palette';

/** Warm, wellness-oriented palette for the patient experience. */
export const patientLightColors: ColorTokens = {
  background: '#F0F7FF',
  surface: '#FFFFFF',
  surfaceAlt: '#E0F0FE',
  border: '#BFDBFE',
  text: '#0C2340',
  textMuted: '#4B6A8A',
  primary: '#2563EB',
  primaryMuted: '#DBEAFE',
  accent: '#0EA5E9',
  onPrimary: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  onDanger: '#FFFFFF',
  info: '#2563EB',
  focusRing: '#2563EB',
  overlay: 'rgba(12, 35, 64, 0.45)',
  shadow: 'rgba(37, 99, 235, 0.14)',
  gradient: {
    backgroundStart: '#F0F7FF',
    backgroundMid: '#E8F2FF',
    backgroundEnd: '#DCEBFF',
    heroStart: '#2563EB',
    heroMid: '#0EA5E9',
    heroEnd: '#06B6D4',
    cardStart: '#FFFFFF',
    cardEnd: '#F0F9FF',
  },
};

export const patientDarkColors: ColorTokens = {
  background: '#0A1628',
  surface: '#112240',
  surfaceAlt: '#1A3058',
  border: '#2A4A72',
  text: '#F0F7FF',
  textMuted: '#94B8E0',
  primary: '#60A5FA',
  primaryMuted: '#1E3A5F',
  accent: '#38BDF8',
  onPrimary: '#0A1628',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  onDanger: '#0A1628',
  info: '#60A5FA',
  focusRing: '#93C5FD',
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(96, 165, 250, 0.18)',
  gradient: {
    backgroundStart: '#0A1628',
    backgroundMid: '#0F1F3D',
    backgroundEnd: '#142848',
    heroStart: '#1D4ED8',
    heroMid: '#0284C7',
    heroEnd: '#0891B2',
    cardStart: '#112240',
    cardEnd: '#152A50',
  },
};

/** Clinical, professional palette for the provider experience. */
export const providerLightColors: ColorTokens = {
  background: '#F1F5F4',
  surface: '#FAFCFB',
  surfaceAlt: '#E6EEEC',
  border: '#CBD8D4',
  text: '#0F1A17',
  textMuted: '#4A5C57',
  primary: '#0F766E',
  primaryMuted: '#CCFBF1',
  accent: '#475569',
  onPrimary: '#FFFFFF',
  success: '#047857',
  warning: '#B45309',
  danger: '#B91C1C',
  onDanger: '#FFFFFF',
  info: '#0F766E',
  focusRing: '#0F766E',
  overlay: 'rgba(15, 26, 23, 0.5)',
  shadow: 'rgba(15, 118, 110, 0.14)',
  gradient: {
    backgroundStart: '#F1F5F4',
    backgroundMid: '#E8EFED',
    backgroundEnd: '#DFE9E6',
    heroStart: '#134E4A',
    heroMid: '#0F766E',
    heroEnd: '#1E293B',
    cardStart: '#FAFCFB',
    cardEnd: '#EDF3F1',
  },
};

export const providerDarkColors: ColorTokens = {
  background: '#0C1210',
  surface: '#111916',
  surfaceAlt: '#1A2420',
  border: '#2D3B36',
  text: '#ECFDF5',
  textMuted: '#94A89F',
  primary: '#2DD4BF',
  primaryMuted: '#134E4A',
  accent: '#64748B',
  onPrimary: '#0C1210',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FCA5A5',
  onDanger: '#0C1210',
  info: '#2DD4BF',
  focusRing: '#5EEAD4',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(45, 212, 191, 0.15)',
  gradient: {
    backgroundStart: '#0C1210',
    backgroundMid: '#101A17',
    backgroundEnd: '#152019',
    heroStart: '#0F3D38',
    heroMid: '#0F766E',
    heroEnd: '#1E293B',
    cardStart: '#111916',
    cardEnd: '#162019',
  },
};

export type Persona = 'patient' | 'provider';

export function colorsForPersona(
  persona: Persona,
  isDark: boolean,
): ColorTokens {
  if (persona === 'provider') {
    return isDark ? providerDarkColors : providerLightColors;
  }
  return isDark ? patientDarkColors : patientLightColors;
}
