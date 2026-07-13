import { View } from 'react-native';

import { Badge, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments } from '@/services/clinical.service';
import { mockPatient } from '@/services/mockData';
import { Appointment } from '@/types/models';
import { appointmentStatusTone, appointmentTypeLabel, formatDateTime } from '@/utils/format';

export function ProviderScheduleScreen() {
  const theme = useTheme();
  const { data } = useAsync(() => getAppointments('patient-1'), []);

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
      <Text variant="heading">Schedule</Text>
      {Object.entries(byDay).map(([day, appts]) => (
        <View key={day} style={{ gap: theme.spacing.sm }}>
          <SectionHeader title={day} />
          {(appts ?? []).map((a) => (
            <Card key={a.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">
                    {mockPatient.name.given} {mockPatient.name.family}
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
      ))}
    </Screen>
  );
}
