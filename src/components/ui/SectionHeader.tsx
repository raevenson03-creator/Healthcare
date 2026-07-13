import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const theme = useTheme();
  const accent = theme.persona === 'provider' ? theme.colors.accent : theme.colors.primary;

  return (
    <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.xs }}>
      <View
        style={{
          height: 3,
          width: 40,
          borderRadius: theme.radius.pill,
          backgroundColor: accent,
          opacity: theme.persona === 'provider' ? 0.85 : 0.7,
        }}
      />
      <View
        accessibilityRole="header"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="title">{title}</Text>
        {action}
      </View>
    </View>
  );
}
