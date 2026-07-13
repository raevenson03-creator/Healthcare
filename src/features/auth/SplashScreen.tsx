import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui';

export function SplashScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        gap: theme.spacing.lg,
      }}
    >
      <Text variant="display" tone="primary" weight="bold">
        CareBridge
      </Text>
      <ActivityIndicator color={theme.colors.primary} />
      <Text variant="caption" tone="muted" accessibilityLabel="Loading, please wait">
        Securing your session…
      </Text>
    </View>
  );
}
