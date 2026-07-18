import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Button, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments } from '@/services/clinical.service';
import { AppointmentsStackParamList } from '@/navigation/types';
import { appointmentStatusTone, appointmentTypeLabel, formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'AppointmentsList'>;

export function AppointmentsListScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const patientId = user?.fhirReference ?? 'patient-1';
  const { data, loading } = useAsync(() => getAppointments(patientId), [patientId]);

  const now = new Date();
  const all = data ?? [];
  const upcoming = all.filter((a) => new Date(a.start) >= now && a.status !== 'cancelled');
  const past = all.filter((a) => new Date(a.start) < now || a.status === 'cancelled');

  return (
    <Screen>
      <Button label="Book new appointment" onPress={() => navigation.navigate('BookAppointment')} />

      <SectionHeader title="Upcoming" />
      {loading ? (
        <Text tone="muted">Loading…</Text>
      ) : upcoming.length === 0 ? (
        <Card>
          <Text tone="muted">No upcoming appointments.</Text>
        </Card>
      ) : (
        upcoming.map((a) => (
          <Card
            key={a.id}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: a.id })}
            accessibilityLabel={`${a.reason} with ${a.practitionerName} on ${formatDateTime(a.start)}, status ${a.status}`}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyLarge" weight="semibold">
                  {a.reason}
                </Text>
                <Text tone="muted">{a.practitionerName}</Text>
                <Text>{formatDateTime(a.start)}</Text>
                <Text variant="caption" tone="muted">
                  {appointmentTypeLabel(a.type)}
                  {a.locationText ? ` · ${a.locationText}` : ''}
                </Text>
              </View>
              <Badge label={a.status} tone={appointmentStatusTone(a.status)} />
            </View>
          </Card>
        ))
      )}

      <SectionHeader title="Past & cancelled" />
      {past.map((a) => (
        <Card
          key={a.id}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: a.id })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text weight="medium">{a.reason}</Text>
              <Text variant="caption" tone="muted">
                {formatDateTime(a.start)} · {a.practitionerName}
              </Text>
            </View>
            <Badge label={a.status} tone={appointmentStatusTone(a.status)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
