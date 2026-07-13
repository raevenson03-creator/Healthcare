import { Pressable, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export function Card({ children, onPress, accessibilityLabel, accessibilityHint, style }: CardProps) {
  const theme = useTheme();
  const content: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [content, { opacity: pressed ? 0.9 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[content, style]}>{children}</View>;
}
