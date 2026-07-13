import { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

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
  const borderColor = errorText
    ? theme.colors.danger
    : focused
      ? theme.colors.focusRing
      : theme.colors.border;

  return (
    <View style={{ gap: 4 }}>
      <Text variant="body" weight="medium">
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={label}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
