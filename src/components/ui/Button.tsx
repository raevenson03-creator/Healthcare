import { ActivityIndicator, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

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
    outline: theme.colors.surface,
  };
  const fg: Record<ButtonVariant, 'onPrimary' | 'default' | 'primary'> = {
    primary: 'onPrimary',
    secondary: 'default',
    ghost: 'primary',
    danger: 'onPrimary',
    outline: 'primary',
  };
  const border: Record<ButtonVariant, ViewStyle> = {
    primary: { borderWidth: 0 },
    secondary: { borderWidth: 0 },
    ghost: { borderWidth: 1.5, borderColor: theme.colors.primary },
    danger: { borderWidth: 0 },
    outline: { borderWidth: 2, borderColor: theme.colors.primary },
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
          styles.wrapper,
          animatedStyle,
          {
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
            ...(Platform.OS === 'web' && hovered && !isDisabled
              ? { transform: [{ scale: 1.02 }] }
              : {}),
          },
          style,
        ];
      }}
    >
      <View
        style={[
          styles.base,
          {
            backgroundColor: bg[variant],
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.lg,
            ...border[variant],
            ...(variant === 'primary'
              ? {
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 4,
                }
              : {}),
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'secondary' || variant === 'ghost' || variant === 'outline'
                ? theme.colors.primary
                : theme.colors.onPrimary
            }
          />
        ) : (
          <Text variant="bodyLarge" weight="semibold" tone={fg[variant]}>
            {label}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
  },
  base: {
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
