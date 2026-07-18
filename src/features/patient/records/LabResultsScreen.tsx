import { View } from 'react-native';

import { Badge, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getLabReports } from '@/services/clinical.service';
import { formatDate } from '@/utils/format';

export function LabResultsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const patientId = user?.fhirReference ?? 'patient-1';
  const { data, loading } = useAsync(() => getLabReports(patientId), [patientId]);

  return (
    <Screen>
      {loading ? <Text tone="muted">Loading results…</Text> : null}
      {(data ?? []).map((report) => (
        <Card key={report.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" weight="semibold">
                {report.panel}
              </Text>
              <Text variant="caption" tone="muted">
                Issued {formatDate(report.issued)}
              </Text>
            </View>
            {report.hasAbnormal ? <Badge label="Flagged" tone="warning" /> : <Badge label="Normal" tone="success" />}
          </View>
          <View style={{ gap: theme.spacing.sm }}>
            {report.observations.map((o) => (
              <View
                key={o.id}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                accessible
                accessibilityLabel={`${o.label}: ${o.value} ${o.unit}, ${o.flag ?? 'normal'}`}
              >
                <Text>{o.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <Text weight="medium">
                    {o.value} {o.unit}
                  </Text>
                  {o.flag && o.flag !== 'normal' ? (
                    <Badge label={o.flag} tone={o.flag === 'critical' ? 'danger' : 'warning'} />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
