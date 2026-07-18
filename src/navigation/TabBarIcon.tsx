import { Ionicons } from '@expo/vector-icons';

/**
 * Persona-aware tab icon using Ionicons. Hidden from screen readers because
 * the tab bar already exposes a text label.
 */
export function TabBarIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) {
  const iconName = focused ? name : (`${name}-outline` as keyof typeof Ionicons.glyphMap);
  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
