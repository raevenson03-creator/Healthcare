import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { getAllergies, getConditions } from '@/services/clinical.service';
import { RecordsStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsOverview'>;

export function RecordsOverviewScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();
  const patientId = user?.fhirReference ?? 'patient-1';

  const conditions = useAsync(() => getConditions(patientId), [patientId]);
  const allergies = useAsync(() => getAllergies(patientId), [patientId]);

  const links: { label: string; screen: keyof RecordsStackParamList; hint: string }[] = [
    { label: 'Vitals', screen: 'Vitals', hint: 'View blood pressure, glucose, weight and more' },
    { label: 'Lab results', screen: 'LabResults', hint: 'View lab reports and trends' },
    { label: 'Medications', screen: 'Medications', hint: 'View medications and reminders' },
  ];

  return (
    <Screen>
      <View style={{ gap: theme.spacing.sm }}>
        {links.map((l) => (
          <Card
            key={l.screen}
            onPress={() => navigation.navigate(l.screen)}
            accessibilityLabel={l.label}
            accessibilityHint={l.hint}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyLarge" weight="semibold">
                {l.label}
              </Text>
              <Text tone="muted">›</Text>
            </View>
          </Card>
        ))}
      </View>

      <SectionHeader title="Allergies" />
      <Card>
        {(allergies.data ?? []).length === 0 ? (
          <Text tone="muted">No known allergies.</Text>
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {(allergies.data ?? []).map((a) => (
              <View key={a.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{a.substance}</Text>
                  <Text variant="caption" tone="muted">
                    {a.reaction}
                  </Text>
                </View>
                <Badge
                  label={a.severity}
                  tone={a.severity === 'anaphylaxis' || a.severity === 'severe' ? 'danger' : 'warning'}
                />
              </View>
            ))}
          </View>
        )}
      </Card>

      <SectionHeader title="Conditions" />
      <Card>
        {(conditions.data ?? []).map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <View style={{ flex: 1 }}>
              <Text weight="medium">{c.label}</Text>
              <Text variant="caption" tone="muted">
                ICD-10 {c.code}
              </Text>
            </View>
            <Badge label={c.status} tone={c.status === 'active' || c.status === 'chronic' ? 'info' : 'neutral'} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
