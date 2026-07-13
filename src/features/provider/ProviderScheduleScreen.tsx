import { View } from 'react-native';

import { Badge, Card, FadeInView, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments, getPatient } from '@/services/clinical.service';
import { Appointment } from '@/types/models';
import { appointmentStatusTone, appointmentTypeLabel, formatDateTime } from '@/utils/format';

export function ProviderScheduleScreen() {
  const theme = useTheme();
  const { data } = useAsync(() => getAppointments('patient-1'), []);
  const patient = useAsync(() => getPatient('patient-1'), []);
  const p = patient.data;

  const byDay = (data ?? []).reduce<Record<string, Appointment[]>>((acc, a) => {
    const day = new Date(a.start).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    (acc[day] ??= []).push(a);
    return acc;
  }, {});

  return (
    <Screen>
      <FadeInView>
        <Text variant="heading">Schedule</Text>
      </FadeInView>
      {Object.entries(byDay).map(([day, appts], dayIndex) => (
        <FadeInView key={day} delay={80 + dayIndex * 60}>
          <View style={{ gap: theme.spacing.sm }}>
            <SectionHeader title={day} />
            {(appts ?? []).map((a) => (
              <Card key={a.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text weight="semibold">
                      {p ? `${p.name.given} ${p.name.family}` : '…'}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {formatDateTime(a.start)} · {appointmentTypeLabel(a.type)}
                    </Text>
                    <Text variant="caption">{a.reason}</Text>
                  </View>
                  <Badge label={a.status} tone={appointmentStatusTone(a.status)} />
                </View>
              </Card>
            ))}
          </View>
        </FadeInView>
      ))}
    </Screen>
  );
}
