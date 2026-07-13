import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Standard screen container: applies safe-area insets, themed background, and
 * consistent padding. Use `scroll` for content that can exceed the viewport
 * (important when users enable large font scaling — spec 1.4).
 */
export function Screen({ children, scroll = true, padded = true, contentStyle }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const base: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const inner: ViewStyle = {
    padding: padded ? theme.spacing.lg : 0,
    paddingTop: insets.top + (padded ? theme.spacing.md : 0),
    paddingBottom: insets.bottom + theme.spacing.xl,
    gap: theme.spacing.md,
  };

  if (scroll) {
    return (
      <View style={base}>
        <ScrollView
          contentContainerStyle={[inner, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[base, inner, contentStyle]}>{children}</View>;
}
