import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Card, FadeInView, PersonaHeader, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments, getPatient } from '@/services/clinical.service';
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
  const { data } = useAsync(() => getAppointments('patient-1'), []);
  const patient = useAsync(() => getPatient('patient-1'), []);

  const today = (data ?? []).filter((a) => a.status !== 'cancelled');
  const p = patient.data;

  return (
    <Screen>
      <FadeInView>
        <PersonaHeader
          greeting={`Good morning, ${user?.displayName ?? 'Doctor'}`}
          subtitle={`${today.length} visits scheduled · ${TASK_QUEUE.reduce((n, t) => n + t.count, 0)} items in your queue`}
        />
      </FadeInView>

      <FadeInView delay={80}>
        <SectionHeader title="Task queue" />
      </FadeInView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {TASK_QUEUE.map((t, i) => (
          <FadeInView key={t.id} delay={100 + i * 40} style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Card
              style={{
                borderLeftWidth: 4,
                borderLeftColor:
                  t.tone === 'danger'
                    ? theme.colors.danger
                    : t.tone === 'warning'
                      ? theme.colors.warning
                      : theme.colors.primary,
              }}
            >
              <Text variant="heading">{t.count}</Text>
              <Text variant="caption" tone="muted">
                {t.label}
              </Text>
            </Card>
          </FadeInView>
        ))}
      </View>

      <FadeInView delay={200}>
        <SectionHeader title="Today’s schedule" />
      </FadeInView>
      {today.map((a, i) => (
        <FadeInView key={a.id} delay={220 + i * 50}>
          <Card
            onPress={() => navigation.navigate('PatientChart', { patientId: a.patientId })}
            accessibilityLabel={`${p?.name.given ?? ''} ${p?.name.family ?? ''}, ${a.reason}, ${formatDateTime(a.start)}. Open chart.`}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyLarge" weight="semibold">
                  {p ? `${p.name.given} ${p.name.family}` : 'Loading…'}
                </Text>
                <Text variant="caption" tone="muted">
                  {p ? `${calculateAge(p.birthDate)} yrs · ${a.reason}` : a.reason}
                </Text>
                <Text variant="caption">
                  {formatDateTime(a.start)} · {appointmentTypeLabel(a.type)}
                </Text>
              </View>
              <Badge label={a.status} tone={appointmentStatusTone(a.status)} />
            </View>
          </Card>
        </FadeInView>
      ))}
    </Screen>
  );
}
