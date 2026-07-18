import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

interface PersonaHeaderProps {
  greeting: string;
  subtitle: string;
  style?: ViewStyle;
}

const CONFIG = {
  patient: {
    icon: 'heart' as const,
    label: 'Patient Portal',
    badge: 'Your health hub',
  },
  provider: {
    icon: 'medkit' as const,
    label: 'Clinical Workspace',
    badge: 'Provider dashboard',
  },
};

/** Role-branded hero banner for dashboard screens. */
export function PersonaHeader({ greeting, subtitle, style }: PersonaHeaderProps) {
  const theme = useTheme();
  const persona = theme.persona ?? 'patient';
  const config = CONFIG[persona];

  return (
    <LinearGradient
      colors={[theme.colors.gradient.heroStart, theme.colors.gradient.heroMid, theme.colors.gradient.heroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            backgroundColor: 'rgba(255,255,255,0.18)',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 6,
            borderRadius: theme.radius.pill,
          }}
        >
          <Ionicons name={config.icon} size={16} color={theme.colors.onPrimary} />
          <Text variant="caption" weight="semibold" tone="onPrimary">
            {config.label}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.radius.pill,
          }}
        >
          <Text variant="caption" tone="onPrimary" style={{ opacity: 0.9 }}>
            {config.badge}
          </Text>
        </View>
      </View>

      <Text variant="heading" tone="onPrimary">
        {greeting}
      </Text>
      <Text variant="body" tone="onPrimary" style={{ opacity: 0.92 }}>
        {subtitle}
      </Text>
    </LinearGradient>
  );
}
