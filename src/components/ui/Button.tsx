import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  accessibilityHint,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceAlt,
    ghost: 'transparent',
    danger: theme.colors.danger,
  };
  const fg: Record<ButtonVariant, 'onPrimary' | 'default' | 'primary'> = {
    primary: 'onPrimary',
    secondary: 'default',
    ghost: 'primary',
    danger: 'onPrimary',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          borderColor: variant === 'ghost' ? theme.colors.primary : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: theme.spacing.lg,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? theme.colors.primary : theme.colors.onPrimary} />
      ) : (
        <Text variant="bodyLarge" weight="semibold" tone={fg[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
