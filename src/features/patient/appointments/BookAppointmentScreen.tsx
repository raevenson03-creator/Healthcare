import { useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Button, Card, FadeInView, Screen, SectionHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { bookAppointment, getPractitioners } from '@/services/clinical.service';
import { AppointmentType } from '@/types/models';
import { AppointmentsStackParamList } from '@/navigation/types';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'BookAppointment'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VISIT_TYPES: { key: AppointmentType; label: string }[] = [
  { key: 'in-person', label: 'In-person' },
  { key: 'video', label: 'Video visit' },
  { key: 'phone', label: 'Phone' },
];

function generateSlots(): string[] {
  const slots: string[] = [];
  const base = new Date();
  base.setDate(base.getDate() + 1);
  base.setHours(9, 0, 0, 0);
  for (let i = 0; i < 6; i++) {
    slots.push(new Date(base.getTime() + i * 45 * 60000).toISOString());
  }
  return slots;
}

function SelectChip({
  active,
  onPress,
  label,
  accessibilityLabel,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 14 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      style={(state) => {
        const hovered =
          Platform.OS === 'web' &&
          'hovered' in state &&
          Boolean((state as { hovered?: boolean }).hovered);
        return [
        animatedStyle,
        {
          minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.pill,
          borderWidth: active ? 2 : 1,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
          ...(Platform.OS === 'web' && hovered ? { borderColor: theme.colors.accent } : {}),
        },
        ];
      }}
    >
      <Text weight={active ? 'semibold' : 'regular'} tone={active ? 'primary' : 'default'}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function BookAppointmentScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const practitioners = useAsync(() => getPractitioners(), []);

  const [type, setType] = useState<AppointmentType>('video');
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const slots = useMemo(generateSlots, []);
  const list = practitioners.data ?? [];
  const selectedId = practitionerId ?? list[0]?.id ?? null;
  const practitioner = list.find((p) => p.id === selectedId);

  const canSubmit = !!slot && reason.trim().length > 0 && !!practitioner;

  const onSubmit = async () => {
    if (!slot || !practitioner) return;
    setSubmitting(true);
    try {
      const start = slot;
      const end = new Date(new Date(slot).getTime() + 30 * 60000).toISOString();
      await bookAppointment({
        patientId: user?.fhirReference ?? 'patient-1',
        practitionerId: practitioner.id,
        practitionerName: `Dr. ${practitioner.name.given} ${practitioner.name.family}`,
        type,
        start,
        end,
        reason: reason.trim(),
        locationText: type === 'in-person' ? 'Main Clinic' : 'Video visit',
      });
      navigation.navigate('AppointmentsList');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <FadeInView>
        <SectionHeader title="Visit type" />
      </FadeInView>
      <FadeInView delay={40}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          {VISIT_TYPES.map((v) => (
            <SelectChip
              key={v.key}
              active={type === v.key}
              onPress={() => setType(v.key)}
              label={v.label}
            />
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <SectionHeader title="Provider" />
      </FadeInView>
      <View style={{ gap: theme.spacing.sm }}>
        {list.map((p, i) => (
          <FadeInView key={p.id} delay={100 + i * 40}>
            <Card
              onPress={() => setPractitionerId(p.id)}
              accessibilityLabel={`Dr. ${p.name.given} ${p.name.family}, ${p.specialty}`}
              style={{
                borderColor: selectedId === p.id ? theme.colors.primary : theme.colors.border,
                borderWidth: selectedId === p.id ? 2 : 1,
              }}
            >
              <Text weight="semibold">
                Dr. {p.name.given} {p.name.family}
              </Text>
              <Text variant="caption" tone="muted">
                {p.specialty}
              </Text>
            </Card>
          </FadeInView>
        ))}
      </View>

      <FadeInView delay={160}>
        <SectionHeader title="Choose a time" />
      </FadeInView>
      <FadeInView delay={180}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          {slots.map((s) => {
            const active = slot === s;
            const label = new Date(s).toLocaleString(undefined, {
              weekday: 'short',
              hour: 'numeric',
              minute: '2-digit',
            });
            return (
              <SelectChip key={s} active={active} onPress={() => setSlot(s)} label={label} accessibilityLabel={label} />
            );
          })}
        </View>
      </FadeInView>

      <FadeInView delay={220}>
        <SectionHeader title="Reason for visit" />
      </FadeInView>
      <FadeInView delay={240}>
        <TextField
          label="Chief complaint"
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Follow-up on blood pressure"
          multiline
          maxLength={250}
          helperText={`${reason.length}/250`}
        />
      </FadeInView>

      <FadeInView delay={280}>
        <Button
          label="Confirm booking"
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={submitting}
          accessibilityHint="Books the appointment and returns to your appointment list"
          style={{ marginTop: theme.spacing.md }}
        />
      </FadeInView>
    </Screen>
  );
}
