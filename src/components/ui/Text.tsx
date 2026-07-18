import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'caption' | 'body' | 'bodyLarge' | 'title' | 'heading' | 'display';
type Tone = 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface AppTextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  weight?: Weight;
}

/**
 * Themed text primitive. Respects the user's dynamic font scale via the theme
 * and caps OS-level scaling to avoid layout breakage (allowFontScaling still
 * on; theme scale is the primary control per spec 1.4).
 */
export function Text({ variant = 'body', tone = 'default', weight, style, ...rest }: AppTextProps) {
  const theme = useTheme();

  const toneColor: Record<Tone, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    primary: theme.colors.primary,
    danger: theme.colors.danger,
    success: theme.colors.success,
    warning: theme.colors.warning,
    onPrimary: theme.colors.onPrimary,
  };

  const defaultWeight: Record<Variant, Weight> = {
    caption: 'regular',
    body: 'regular',
    bodyLarge: 'regular',
    title: 'semibold',
    heading: 'bold',
    display: 'bold',
  };

  const resolved: TextStyle = {
    fontSize: theme.fontSizes[variant],
    color: toneColor[tone],
    fontWeight: theme.fontWeights[weight ?? defaultWeight[variant]] as TextStyle['fontWeight'],
    lineHeight: theme.fontSizes[variant] * 1.35,
  };

  return <RNText maxFontSizeMultiplier={2} style={[resolved, style]} {...rest} />;
}
