import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Badge, Button, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getMedications, requestRefill } from '@/services/clinical.service';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';

type DoseKey = string; // `${medId}@${time}`

export function MedicationsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const patientId = user?.fhirReference ?? 'patient-1';
  const { data, loading } = useAsync(() => getMedications(patientId), [patientId]);
  const [taken, setTaken] = useState<Record<DoseKey, boolean>>({});

  const meds = data ?? [];
  const totalDoses = meds.reduce((sum, m) => sum + m.scheduleTimes.length, 0);
  const takenCount = Object.values(taken).filter(Boolean).length;
  const adherencePct = totalDoses === 0 ? 100 : Math.round((takenCount / totalDoses) * 100);

  const toggle = (key: DoseKey) => setTaken((prev) => ({ ...prev, [key]: !prev[key] }));

  const onRefill = async (id: string, name: string) => {
    await requestRefill(id);
    Alert.alert('Refill requested', `We sent a refill request for ${name} to your pharmacy.`);
  };

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="caption" tone="muted">
              Today’s adherence
            </Text>
            <Text variant="heading">{adherencePct}%</Text>
          </View>
          <Badge
            label={`${takenCount}/${totalDoses} doses`}
            tone={adherencePct >= 80 ? 'success' : adherencePct >= 50 ? 'warning' : 'danger'}
          />
        </View>
      </Card>

      <SectionHeader title="Today’s schedule" />
      {loading ? <Text tone="muted">Loading medications…</Text> : null}
      {meds.map((m) => (
        <Card key={m.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" weight="semibold">
                {m.name} {m.dose}
              </Text>
              <Text variant="caption" tone="muted">
                {m.frequency} · {m.route} · {m.indication ?? '—'}
              </Text>
              <Text variant="caption" tone="muted">
                Prescriber: {m.prescriberName}
              </Text>
            </View>
            {m.refillsRemaining === 0 ? <Badge label="No refills" tone="danger" /> : <Badge label={`${m.refillsRemaining} refills`} tone="neutral" />}
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap', marginTop: theme.spacing.md }}>
            {m.scheduleTimes.map((t) => {
              const key = `${m.id}@${t}`;
              const isTaken = !!taken[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => toggle(key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isTaken }}
                  accessibilityLabel={`${m.name} at ${t}`}
                  accessibilityHint={isTaken ? 'Marked as taken. Tap to undo.' : 'Tap to mark as taken.'}
                  style={{
                    minHeight: MIN_TOUCH_TARGET,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.lg,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1,
                    borderColor: isTaken ? theme.colors.success : theme.colors.border,
                    backgroundColor: isTaken ? theme.colors.success : theme.colors.surface,
                  }}
                >
                  <Text tone={isTaken ? 'onPrimary' : 'default'} weight="medium">
                    {isTaken ? '✓ ' : ''}
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Request refill"
            variant="secondary"
            onPress={() => onRefill(m.id, m.name)}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>
      ))}
    </Screen>
  );
}
