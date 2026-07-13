import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Badge, Button, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getAppointments, getMedications, getVitals, getLabReports } from '@/services/clinical.service';
import { PatientTabParamList } from '@/navigation/types';
import { appointmentStatusTone, appointmentTypeLabel, relativeTime } from '@/utils/format';

type Nav = BottomTabNavigationProp<PatientTabParamList>;

export function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const patientId = user?.fhirReference ?? 'patient-1';

  const appointments = useAsync(() => getAppointments(patientId), [patientId]);
  const meds = useAsync(() => getMedications(patientId), [patientId]);
  const vitals = useAsync(() => getVitals(patientId), [patientId]);
  const labs = useAsync(() => getLabReports(patientId), [patientId]);

  const upcoming = (appointments.data ?? [])
    .filter((a) => new Date(a.start) > new Date() && a.status !== 'cancelled')
    .slice(0, 3);

  const todaysMeds = meds.data ?? [];
  const abnormalLabs = (labs.data ?? []).filter((l) => l.hasAbnormal);

  return (
    <Screen>
      <View>
        <Text variant="heading">Hello, {user?.displayName?.split(' ')[0] ?? 'there'}</Text>
        <Text tone="muted">Here’s your health at a glance.</Text>
      </View>

      <SectionHeader
        title="Upcoming appointments"
        action={
          <Button
            label="Book"
            variant="ghost"
            fullWidth={false}
            onPress={() => navigation.navigate('Appointments', { screen: 'BookAppointment' })}
          />
        }
      />
      {upcoming.length === 0 ? (
        <Card>
          <Text tone="muted">No upcoming appointments.</Text>
        </Card>
      ) : (
        upcoming.map((appt) => (
          <Card
            key={appt.id}
            onPress={() =>
              navigation.navigate('Appointments', {
                screen: 'AppointmentDetail',
                params: { appointmentId: appt.id },
              })
            }
            accessibilityLabel={`${appt.reason} with ${appt.practitionerName}, ${relativeTime(appt.start)}`}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyLarge" weight="semibold">
                  {appt.reason}
                </Text>
                <Text tone="muted">
                  {appt.practitionerName} · {appointmentTypeLabel(appt.type)}
                </Text>
                <Text tone="primary" weight="medium">
                  {relativeTime(appt.start)}
                </Text>
              </View>
              <Badge label={appt.status} tone={appointmentStatusTone(appt.status)} />
            </View>
          </Card>
        ))
      )}

      <SectionHeader title="Today’s medications" />
      <Card>
        {todaysMeds.length === 0 ? (
          <Text tone="muted">No active medications.</Text>
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {todaysMeds.map((m) => (
              <View
                key={m.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                accessible
                accessibilityLabel={`${m.name} ${m.dose}, ${m.frequency}, times ${m.scheduleTimes.join(' and ')}`}
              >
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">
                    {m.name} {m.dose}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {m.scheduleTimes.join(' · ')} · {m.frequency}
                  </Text>
                </View>
              </View>
            ))}
            <Button
              label="Open medication reminders"
              variant="secondary"
              onPress={() => navigation.navigate('Records', { screen: 'Medications' })}
            />
          </View>
        )}
      </Card>

      <SectionHeader title="Recent results" />
      {abnormalLabs.length > 0 ? (
        <Card
          onPress={() => navigation.navigate('Records', { screen: 'LabResults' })}
          accessibilityLabel={`${abnormalLabs.length} lab reports with flagged results. Open lab results.`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Badge label="Needs review" tone="warning" />
            <Text style={{ flex: 1 }}>
              {abnormalLabs.length} report{abnormalLabs.length > 1 ? 's' : ''} with flagged values
            </Text>
          </View>
        </Card>
      ) : (
        <Card>
          <Text tone="muted">No new flagged results.</Text>
        </Card>
      )}

      <SectionHeader title="Health metrics" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {(vitals.data ?? []).slice(0, 4).map((v) => (
          <Card key={v.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Text variant="caption" tone="muted">
              {v.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text variant="title">{v.value}</Text>
              <Text variant="caption" tone="muted">
                {v.unit}
              </Text>
            </View>
            {v.flag && v.flag !== 'normal' ? (
              <Badge label={v.flag} tone={v.flag === 'critical' ? 'danger' : 'warning'} />
            ) : null}
          </Card>
        ))}
      </View>

      <SectionHeader title="Quick actions" />
      <View style={{ gap: theme.spacing.sm }}>
        <Button label="Message my care team" variant="secondary" onPress={() => navigation.navigate('Messages')} />
        <Button label="View health records" variant="secondary" onPress={() => navigation.navigate('Records', { screen: 'RecordsOverview' })} />
      </View>
    </Screen>
  );
}
