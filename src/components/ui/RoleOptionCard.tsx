import { Platform, Pressable, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type DemoRole = 'patient' | 'provider';

interface RoleOptionCardProps {
  role: DemoRole;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const ROLE_CONFIG: Record<
  DemoRole,
  {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    accent: string;
    badge: string;
  }
> = {
  patient: {
    title: 'Patient Portal',
    subtitle: 'Records, appointments & medications',
    icon: 'heart-outline',
    accent: '#0A6FD4',
    badge: 'Member access',
  },
  provider: {
    title: 'Provider Portal',
    subtitle: 'Schedule, charts & clinical tasks',
    icon: 'medkit-outline',
    accent: '#0F766E',
    badge: 'Clinical staff',
  },
};

/** Healthcare-styled role selector for demo account quick access. */
export function RoleOptionCard({ role, selected, onPress, style }: RoleOptionCardProps) {
  const theme = useTheme();
  const config = ROLE_CONFIG[role];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${config.title}. ${config.subtitle}. Demo account.`}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 14 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      style={(state) => {
        const hovered =
          Platform.OS === 'web' &&
          'hovered' in state &&
          Boolean((state as { hovered?: boolean }).hovered);
        return [animatedStyle, { flex: 1 }, style, hovered ? { opacity: 0.95 } : undefined];
      }}
    >
      <View
        style={{
          borderRadius: theme.radius.lg,
          borderWidth: selected ? 2.5 : 1,
          borderColor: selected ? config.accent : theme.colors.border,
          overflow: 'hidden',
          shadowColor: selected ? config.accent : theme.colors.shadow,
          shadowOffset: { width: 0, height: selected ? 6 : 3 },
          shadowOpacity: selected ? 0.25 : 0.12,
          shadowRadius: selected ? 12 : 6,
          elevation: selected ? 5 : 2,
        }}
      >
        <LinearGradient
          colors={
            selected
              ? [`${config.accent}18`, `${config.accent}08`]
              : [theme.colors.surface, theme.colors.gradient.cardEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: theme.spacing.md, gap: theme.spacing.sm, minHeight: 128 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${config.accent}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={config.icon} size={24} color={config.accent} />
            </View>
            {selected ? (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: config.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            ) : null}
          </View>

          <View style={{ gap: 2 }}>
            <Text variant="body" weight="bold">
              {config.title}
            </Text>
            <Text variant="caption" tone="muted">
              {config.subtitle}
            </Text>
          </View>

          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: `${config.accent}15`,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 3,
              borderRadius: theme.radius.pill,
            }}
          >
            <Text variant="caption" weight="semibold" style={{ color: config.accent }}>
              {config.badge}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}
