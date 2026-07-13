import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments } from '@/services/clinical.service';
import { mockPatient } from '@/services/mockData';
import { ProviderStackParamList } from '@/navigation/types';
import { appointmentStatusTone, appointmentTypeLabel, calculateAge, formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<ProviderStackParamList, 'ProviderDashboard'>;

const TASK_QUEUE = [
  { id: 't1', label: 'Prescription renewals', count: 3, tone: 'warning' as const },
  { id: 't2', label: 'Lab results to review', count: 2, tone: 'danger' as const },
  { id: 't3', label: 'Unread patient messages', count: 1, tone: 'info' as const },
  { id: 't4', label: 'Referral requests', count: 1, tone: 'neutral' as const },
];

export function ProviderDashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  // In production this queries the practitioner's schedule; demo reuses appts.
  const { data } = useAsync(() => getAppointments('patient-1'), []);

  const today = (data ?? []).filter((a) => a.status !== 'cancelled');

  return (
    <Screen>
      <View>
        <Text variant="heading">Good morning, {user?.displayName ?? 'Doctor'}</Text>
        <Text tone="muted">You have {today.length} visits on today’s schedule.</Text>
      </View>

      <SectionHeader title="Task queue" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {TASK_QUEUE.map((t) => (
          <Card key={t.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text variant="heading">{t.count}</Text>
            <Text variant="caption" tone="muted">
              {t.label}
            </Text>
          </Card>
        ))}
      </View>

      <SectionHeader title="Today’s schedule" />
      {today.map((a) => (
        <Card
          key={a.id}
          onPress={() => navigation.navigate('PatientChart', { patientId: a.patientId })}
          accessibilityLabel={`${mockPatient.name.given} ${mockPatient.name.family}, ${a.reason}, ${formatDateTime(a.start)}. Open chart.`}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyLarge" weight="semibold">
                {mockPatient.name.given} {mockPatient.name.family}
              </Text>
              <Text variant="caption" tone="muted">
                {calculateAge(mockPatient.birthDate)} yrs · {a.reason}
              </Text>
              <Text variant="caption">
                {formatDateTime(a.start)} · {appointmentTypeLabel(a.type)}
              </Text>
            </View>
            <Badge label={a.status} tone={appointmentStatusTone(a.status)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
