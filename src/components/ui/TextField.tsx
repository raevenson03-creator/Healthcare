import { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';
import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label: string;
  errorText?: string;
  helperText?: string;
}

export function TextField({ label, errorText, helperText, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const borderColor = errorText
    ? theme.colors.danger
    : focused
      ? theme.colors.focusRing
      : theme.colors.border;

  const animatedWrap = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + focusAnim.value * 0.008 }],
  }));

  return (
    <View style={{ gap: 4 }}>
      <Text variant="body" weight="medium">
        {label}
      </Text>
      <Animated.View style={animatedWrap}>
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={label}
          onFocus={() => {
            setFocused(true);
            focusAnim.value = withTiming(1, { duration: 180 });
          }}
          onBlur={() => {
            setFocused(false);
            focusAnim.value = withTiming(0, { duration: 180 });
          }}
          style={[
            {
              minHeight: MIN_TOUCH_TARGET,
              borderWidth: focused ? 2 : 1,
              borderColor,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              color: theme.colors.text,
              fontSize: theme.fontSizes.body,
              backgroundColor: theme.colors.surface,
            },
            style,
          ]}
          {...rest}
        />
      </Animated.View>
      {errorText ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="muted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
