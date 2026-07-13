import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="header"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
      }}
    >
      <Text variant="title">{title}</Text>
      {action}
    </View>
  );
}
