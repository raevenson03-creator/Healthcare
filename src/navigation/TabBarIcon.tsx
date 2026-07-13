import { Text } from 'react-native';

/**
 * Lightweight emoji-based tab icon to avoid pulling an icon font dependency.
 * Marked accessibility-hidden because the tab already exposes a text label to
 * screen readers.
 */
export function TabBarIcon({ symbol, color, size }: { symbol: string; color: string; size: number }) {
  return (
    <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: size * 0.9, color }}>
      {symbol}
    </Text>
  );
}
