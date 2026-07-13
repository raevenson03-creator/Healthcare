import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { GradientBackground } from './GradientBackground';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Use hero gradient (login, splash). Default is subtle app background. */
  variant?: 'default' | 'hero' | 'subtle';
}

/**
 * Standard screen container: applies safe-area insets, themed gradient background,
 * and consistent padding. Use `scroll` for content that can exceed the viewport
 * (important when users enable large font scaling — spec 1.4).
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  contentStyle,
  variant = 'default',
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const inner: ViewStyle = {
    padding: padded ? theme.spacing.lg : 0,
    paddingTop: insets.top + (padded ? theme.spacing.md : 0),
    paddingBottom: insets.bottom + theme.spacing.xl,
    gap: theme.spacing.md,
  };

  if (scroll) {
    return (
      <GradientBackground variant={variant}>
        <ScrollView
          contentContainerStyle={[inner, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {children}
        </ScrollView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant={variant}>
      <View style={[inner, contentStyle]}>{children}</View>
    </GradientBackground>
  );
}
