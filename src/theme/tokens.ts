/** Spacing scale (8pt grid) used across the app for consistent layout. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/**
 * Base type scale (in points). Rendered sizes are multiplied by the user's
 * font-scale preference (up to 2x per spec 1.4 "Dynamic text sizing").
 */
export const fontSizes = {
  caption: 12,
  body: 16,
  bodyLarge: 18,
  title: 22,
  heading: 28,
  display: 34,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * WCAG 2.5.5 / mobile a11y: interactive targets should be at least 44x44pt.
 */
export const MIN_TOUCH_TARGET = 44;

export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof fontSizes;
