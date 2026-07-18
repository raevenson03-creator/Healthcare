import { View } from 'react-native';

import { Badge, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getVitals } from '@/services/clinical.service';
import { formatDateTime } from '@/utils/format';

export function VitalsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const patientId = user?.fhirReference ?? 'patient-1';
  const { data, loading } = useAsync(() => getVitals(patientId), [patientId]);

  return (
    <Screen>
      {loading ? <Text tone="muted">Loading vitals…</Text> : null}
      {(data ?? []).map((v) => (
        <Card key={v.id} accessibilityLabel={`${v.label}: ${v.value} ${v.unit}, ${v.flag ?? 'normal'}`}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" weight="semibold">
                {v.label}
              </Text>
              <Text variant="caption" tone="muted">
                {formatDateTime(v.effective)} · LOINC {v.code}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text variant="title">{v.value}</Text>
                <Text variant="caption" tone="muted">
                  {v.unit}
                </Text>
              </View>
              {v.flag && v.flag !== 'normal' ? (
                <Badge label={v.flag} tone={v.flag === 'critical' ? 'danger' : 'warning'} />
              ) : (
                <Badge label="normal" tone="success" />
              )}
            </View>
          </View>
        </Card>
      ))}
      <Card style={{ marginTop: theme.spacing.sm }}>
        <Text variant="caption" tone="muted">
          Connected devices (Apple Health, Google Fit, Dexcom, blood pressure monitors) sync
          automatically in production via HealthKit / Health Connect and Bluetooth LE.
        </Text>
      </Card>
    </Screen>
  );
}
