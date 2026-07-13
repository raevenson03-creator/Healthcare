import { Platform, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeProvider';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  /** Enable subtle gradient fill and lift animation. */
  elevated?: boolean;
}

export function Card({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  elevated = true,
}: CardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const shadowStyle: ViewStyle = elevated
    ? {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: Platform.OS === 'android' ? 0.25 : 0.9,
        shadowRadius: 14,
        elevation: 4,
      }
    : {};

  const inner = (
    <Animated.View
      style={[
        {
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        },
        shadowStyle,
        animatedStyle,
        style,
      ]}
    >
      {elevated ? (
        <LinearGradient
          colors={[theme.colors.gradient.cardStart, theme.colors.gradient.cardEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: theme.spacing.lg }}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg }}>
          {children}
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 14, stiffness: 400 });
          translateY.value = withSpring(2, { damping: 14, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
          translateY.value = withSpring(0, { damping: 12, stiffness: 300 });
        }}
        style={(state) => {
          const hovered =
            Platform.OS === 'web' &&
            'hovered' in state &&
            Boolean((state as { hovered?: boolean }).hovered);
          return hovered ? { transform: [{ translateY: -2 }] } : undefined;
        }}
      >
        {inner}
      </AnimatedPressable>
    );
  }

  return inner;
}
