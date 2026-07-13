import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down';
  style?: StyleProp<ViewStyle>;
}

/** Stagger-friendly entrance animation for list items and sections. */
export function FadeInView({
  children,
  delay = 0,
  direction = 'up',
  style,
}: FadeInViewProps) {
  const entering = direction === 'down' ? FadeInDown : FadeInUp;
  return (
    <Animated.View entering={entering.delay(delay).duration(420).springify()} style={style}>
      {children}
    </Animated.View>
  );
}

/** Subtle pulsing glow for loading / hero accents. */
export function PulseGlow({ color, size = 120 }: { color: string; size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.55, { duration: 1400 }), withTiming(0.25, { duration: 1400 })),
      -1,
      false,
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          position: 'absolute',
        },
        animatedStyle,
      ]}
    />
  );
}
