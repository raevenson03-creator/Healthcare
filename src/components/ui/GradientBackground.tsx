import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: 'default' | 'hero' | 'subtle';
  style?: ViewStyle;
}

/**
 * Layered gradient background for screens. Adds depth without hurting contrast.
 */
export function GradientBackground({ children, variant = 'default', style }: GradientBackgroundProps) {
  const theme = useTheme();
  const g = theme.colors.gradient;

  const colors: Record<typeof variant, [string, string, ...string[]]> = {
    default: [g.backgroundStart, g.backgroundMid, g.backgroundEnd],
    hero: [g.heroStart, g.heroMid, g.heroEnd],
    subtle: [g.backgroundStart, theme.colors.background],
  };

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={colors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft accent orb */}
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.colors.primary,
            opacity: theme.isDark ? 0.08 : 0.06,
            top: -60,
            right: -40,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          {
            backgroundColor: theme.colors.accent,
            opacity: theme.isDark ? 0.06 : 0.05,
            bottom: 120,
            left: -80,
            width: 220,
            height: 220,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
  },
});
