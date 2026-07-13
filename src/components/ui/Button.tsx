import { ActivityIndicator, Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPressIn={() => {
        if (!isDisabled) scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
      }}
      style={(state) => {
        const { pressed } = state;
        const hovered =
          Platform.OS === 'web' &&
          'hovered' in state &&
          Boolean((state as { hovered?: boolean }).hovered);
        return [
        styles.base,
        animatedStyle,
        {
          backgroundColor: bg[variant],
          borderColor: variant === 'ghost' ? theme.colors.primary : 'transparent',
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: theme.spacing.lg,
          ...(Platform.OS === 'web' && hovered && !isDisabled
            ? {
                transform: [{ scale: 1.02 }],
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 12,
              }
            : {}),
          ...(pressed && !isDisabled ? { opacity: 0.88 } : {}),
        },
        style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.onPrimary
          }
        />
      ) : (
        <Text variant="bodyLarge" weight="semibold" tone={fg[variant]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
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
