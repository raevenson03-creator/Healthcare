import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FadeInView, GradientBackground, PulseGlow, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export function SplashScreen() {
  const theme = useTheme();
  return (
    <GradientBackground variant="hero">
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.lg,
        }}
      >
        <FadeInView>
          <View style={{ alignItems: 'center', position: 'relative' }}>
            <PulseGlow color={theme.colors.onPrimary} size={200} />
            <Animated.View entering={FadeIn.duration(800)}>
              <Text variant="display" tone="onPrimary" weight="bold">
                CareBridge
              </Text>
            </Animated.View>
          </View>
        </FadeInView>
        <ActivityIndicator color={theme.colors.onPrimary} size="large" />
        <Text variant="caption" tone="onPrimary" accessibilityLabel="Loading, please wait" style={{ opacity: 0.85 }}>
          Securing your session…
        </Text>
      </View>
    </GradientBackground>
  );
}
