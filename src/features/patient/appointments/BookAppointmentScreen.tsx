import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Card, Screen, SectionHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { bookAppointment } from '@/services/clinical.service';
import { mockPractitioners } from '@/services/mockData';
import { AppointmentType } from '@/types/models';
import { AppointmentsStackParamList } from '@/navigation/types';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'BookAppointment'>;

const VISIT_TYPES: { key: AppointmentType; label: string }[] = [
  { key: 'in-person', label: 'In-person' },
  { key: 'video', label: 'Video visit' },
  { key: 'phone', label: 'Phone' },
];

/** Generate the next 6 available half-hour slots starting tomorrow 9am. */
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

export function BookAppointmentScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const [type, setType] = useState<AppointmentType>('video');
  const [practitionerId, setPractitionerId] = useState(mockPractitioners[0]!.id);
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const slots = useMemo(generateSlots, []);
  const practitioner = mockPractitioners.find((p) => p.id === practitionerId)!;

  const chipStyle = (active: boolean) => ({
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center' as const,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: active ? 2 : 1,
    borderColor: active ? theme.colors.primary : theme.colors.border,
    backgroundColor: active ? theme.colors.surfaceAlt : theme.colors.surface,
  });

  const canSubmit = !!slot && reason.trim().length > 0;

  const onSubmit = async () => {
    if (!slot) return;
    setSubmitting(true);
    try {
      const start = slot;
      const end = new Date(new Date(slot).getTime() + 30 * 60000).toISOString();
      await bookAppointment({
        patientId: user?.fhirReference ?? 'patient-1',
        practitionerId,
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
      <SectionHeader title="Visit type" />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
        {VISIT_TYPES.map((v) => (
          <Pressable
            key={v.key}
            onPress={() => setType(v.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: type === v.key }}
            accessibilityLabel={v.label}
            style={chipStyle(type === v.key)}
          >
            <Text weight={type === v.key ? 'semibold' : 'regular'}>{v.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Provider" />
      <View style={{ gap: theme.spacing.sm }}>
        {mockPractitioners.map((p) => (
          <Card
            key={p.id}
            onPress={() => setPractitionerId(p.id)}
            accessibilityLabel={`Dr. ${p.name.given} ${p.name.family}, ${p.specialty}`}
            style={{
              borderColor: practitionerId === p.id ? theme.colors.primary : theme.colors.border,
              borderWidth: practitionerId === p.id ? 2 : 1,
            }}
          >
            <Text weight="semibold">
              Dr. {p.name.given} {p.name.family}
            </Text>
            <Text variant="caption" tone="muted">
              {p.specialty}
            </Text>
          </Card>
        ))}
      </View>

      <SectionHeader title="Choose a time" />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
        {slots.map((s) => {
          const active = slot === s;
          return (
            <Pressable
              key={s}
              onPress={() => setSlot(s)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={new Date(s).toLocaleString(undefined, {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })}
              style={chipStyle(active)}
            >
              <Text>
                {new Date(s).toLocaleString(undefined, {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Reason for visit" />
      <TextField
        label="Chief complaint"
        value={reason}
        onChangeText={setReason}
        placeholder="e.g. Follow-up on blood pressure"
        multiline
        maxLength={250}
        helperText={`${reason.length}/250`}
      />

      <Button
        label="Confirm booking"
        onPress={onSubmit}
        disabled={!canSubmit}
        loading={submitting}
        accessibilityHint="Books the appointment and returns to your appointment list"
        style={{ marginTop: theme.spacing.md }}
      />
    </Screen>
  );
}
