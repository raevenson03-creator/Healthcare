import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, BadgeTone, Button, Card, Screen, SectionHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAsync } from '@/hooks/useAsync';
import { getAllergies, getMedications } from '@/services/clinical.service';
import { runAllChecks, type AlertSeverity } from '@/services/clinicalDecisionSupport';
import { ProviderStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ProviderStackParamList, 'Prescribe'>;
type Rt = RouteProp<ProviderStackParamList, 'Prescribe'>;

const severityTone: Record<AlertSeverity, BadgeTone> = {
  contraindicated: 'danger',
  major: 'danger',
  moderate: 'warning',
  minor: 'info',
};

export function PrescribeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();

  const meds = useAsync(() => getMedications(params.patientId), [params.patientId]);
  const allergies = useAsync(() => getAllergies(params.patientId), [params.patientId]);

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [sig, setSig] = useState('');

  // Live clinical decision support as the provider types (spec 4.3 / 8.1).
  const alerts = useMemo(() => {
    if (name.trim().length < 3) return [];
    return runAllChecks(name, meds.data ?? [], allergies.data ?? []);
  }, [name, meds.data, allergies.data]);

  const hasContraindication = alerts.some((a) => a.severity === 'contraindicated');
  const canSubmit = name.trim() && dose.trim() && sig.trim();

  const submit = () => {
    const finish = () => {
      Alert.alert('Prescription sent', `${name} ${dose} routed to the patient’s pharmacy via Surescripts (demo).`);
      navigation.goBack();
    };
    if (hasContraindication) {
      Alert.alert(
        'Contraindication',
        'This prescription has a contraindicated alert. Override requires documented justification.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Override & send', style: 'destructive', onPress: finish },
        ],
      );
    } else {
      finish();
    }
  };

  return (
    <Screen>
      <SectionHeader title="Medication" />
      <TextField
        label="Drug name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Aspirin, Amoxicillin"
        autoCapitalize="words"
        helperText="Try 'aspirin' or 'amoxicillin' to see live safety checks."
      />
      <TextField label="Strength / dose" value={dose} onChangeText={setDose} placeholder="e.g. 81 mg" />
      <TextField
        label="Sig (instructions)"
        value={sig}
        onChangeText={setSig}
        placeholder="e.g. 1 tab PO daily"
        multiline
      />

      {alerts.length > 0 ? (
        <>
          <SectionHeader title="Safety alerts" />
          {alerts.map((a, i) => (
            <Card key={`${a.type}-${i}`} style={{ borderColor: theme.colors.danger }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Badge label={a.severity} tone={severityTone[a.severity]} />
                <Text variant="caption" tone="muted">
                  {a.type}
                </Text>
              </View>
              <Text>{a.message}</Text>
            </Card>
          ))}
        </>
      ) : name.trim().length >= 3 ? (
        <Card>
          <Text tone="success" weight="medium">
            ✓ No interactions, allergy conflicts, or duplicates detected.
          </Text>
        </Card>
      ) : null}

      <Button
        label={hasContraindication ? 'Review & override…' : 'Send prescription'}
        variant={hasContraindication ? 'danger' : 'primary'}
        onPress={submit}
        disabled={!canSubmit}
        style={{ marginTop: theme.spacing.md }}
      />
    </Screen>
  );
}
