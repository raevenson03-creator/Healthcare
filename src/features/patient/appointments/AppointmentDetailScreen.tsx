import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Button, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { cancelAppointment, getAppointments } from '@/services/clinical.service';
import { AppointmentsStackParamList } from '@/navigation/types';
import { appointmentStatusTone, appointmentTypeLabel, formatDateTime } from '@/utils/format';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'AppointmentDetail'>;
type Rt = RouteProp<AppointmentsStackParamList, 'AppointmentDetail'>;

export function AppointmentDetailScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const patientId = user?.fhirReference ?? 'patient-1';
  const { data, reload } = useAsync(() => getAppointments(patientId), [patientId]);
  const [working, setWorking] = useState(false);

  const appt = (data ?? []).find((a) => a.id === params.appointmentId);

  if (!appt) {
    return (
      <Screen>
        <Text tone="muted">Appointment not found.</Text>
      </Screen>
    );
  }

  const isUpcoming = new Date(appt.start) > new Date() && appt.status !== 'cancelled';
  const isVideo = appt.type === 'video';

  const onCancel = () => {
    Alert.alert('Cancel appointment?', 'This will release your time slot.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel appointment',
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          try {
            await cancelAppointment(appt.id);
            reload();
          } finally {
            setWorking(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Card>
        <View style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="title">{appt.reason}</Text>
            <Badge label={appt.status} tone={appointmentStatusTone(appt.status)} />
          </View>
          <Text tone="muted">{appt.practitionerName}</Text>
          <Text variant="bodyLarge">{formatDateTime(appt.start)}</Text>
          <Text tone="muted">
            {appointmentTypeLabel(appt.type)}
            {appt.locationText ? ` · ${appt.locationText}` : ''}
          </Text>
        </View>
      </Card>

      {isUpcoming && isVideo ? (
        <Card>
          <SectionHeader title="Telehealth" />
          <Text tone="muted" style={{ marginBottom: theme.spacing.md }}>
            Run a device check before your visit, then join when your provider is ready.
          </Text>
          <Button
            label="Join video visit"
            onPress={() =>
              Alert.alert(
                'Telehealth (demo)',
                'In production this launches the WebRTC video room with end-to-end encryption (SRTP), device tests, and a pre-visit checklist.',
              )
            }
          />
        </Card>
      ) : null}

      {isUpcoming ? (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Button
            label="Reschedule"
            variant="secondary"
            onPress={() => navigation.navigate('BookAppointment')}
          />
          <Button label="Cancel appointment" variant="danger" onPress={onCancel} loading={working} />
        </View>
      ) : null}
    </Screen>
  );
}
