import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const theme = useTheme();
  const bg: Record<BadgeTone, string> = {
    neutral: theme.colors.surfaceAlt,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
  };
  const isFilled = tone !== 'neutral';
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        backgroundColor: isFilled ? bg[tone] : theme.colors.surfaceAlt,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="caption" weight="semibold" tone={isFilled ? 'onPrimary' : 'muted'}>
        {label}
      </Text>
    </View>
  );
}
