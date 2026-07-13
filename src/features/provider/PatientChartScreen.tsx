import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAsync } from '@/hooks/useAsync';
import {
  getAllergies,
  getConditions,
  getMedications,
  getPatient,
  getVitals,
} from '@/services/clinical.service';
import { ProviderStackParamList } from '@/navigation/types';
import { calculateAge, formatDateTime } from '@/utils/format';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';

type Nav = NativeStackNavigationProp<ProviderStackParamList, 'PatientChart'>;
type Rt = RouteProp<ProviderStackParamList, 'PatientChart'>;

type Tab = 'summary' | 'problems' | 'meds' | 'allergies' | 'vitals';

export function PatientChartScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const [tab, setTab] = useState<Tab>('summary');

  const patient = useAsync(() => getPatient(params.patientId), [params.patientId]);
  const conditions = useAsync(() => getConditions(params.patientId), [params.patientId]);
  const meds = useAsync(() => getMedications(params.patientId), [params.patientId]);
  const allergies = useAsync(() => getAllergies(params.patientId), [params.patientId]);
  const vitals = useAsync(() => getVitals(params.patientId), [params.patientId]);

  const p = patient.data;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    { key: 'problems', label: 'Problems' },
    { key: 'meds', label: 'Meds' },
    { key: 'allergies', label: 'Allergies' },
    { key: 'vitals', label: 'Vitals' },
  ];

  return (
    <Screen>
      <Card>
        {p ? (
          <>
            <Text variant="title">
              {p.name.given} {p.name.family}
            </Text>
            <Text tone="muted">
              {calculateAge(p.birthDate)} yrs · {p.gender} · DOB {p.birthDate}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
              {p.bloodType ? <Badge label={`Blood ${p.bloodType}`} tone="neutral" /> : null}
              {(allergies.data ?? []).some((a) => a.severity === 'anaphylaxis' || a.severity === 'severe') ? (
                <Badge label="Severe allergy" tone="danger" />
              ) : null}
            </View>
          </>
        ) : (
          <Text tone="muted">Loading chart…</Text>
        )}
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
            accessibilityLabel={t.label}
            style={{
              minHeight: MIN_TOUCH_TARGET,
              justifyContent: 'center',
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radius.pill,
              borderWidth: tab === t.key ? 2 : 1,
              borderColor: tab === t.key ? theme.colors.primary : theme.colors.border,
              backgroundColor: tab === t.key ? theme.colors.surfaceAlt : theme.colors.surface,
            }}
          >
            <Text weight={tab === t.key ? 'semibold' : 'regular'}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'summary' ? (
        <Card>
          <Text weight="semibold">Active problems</Text>
          {(conditions.data ?? []).map((c) => (
            <Text key={c.id} tone="muted">
              • {c.label} ({c.code})
            </Text>
          ))}
          <Text weight="semibold" style={{ marginTop: theme.spacing.md }}>
            Active medications
          </Text>
          {(meds.data ?? []).map((m) => (
            <Text key={m.id} tone="muted">
              • {m.name} {m.dose} {m.frequency}
            </Text>
          ))}
        </Card>
      ) : null}

      {tab === 'problems'
        ? (conditions.data ?? []).map((c) => (
            <Card key={c.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{c.label}</Text>
                  <Text variant="caption" tone="muted">
                    ICD-10 {c.code} · onset {c.onsetDate ?? '—'}
                  </Text>
                </View>
                <Badge label={c.status} tone="info" />
              </View>
            </Card>
          ))
        : null}

      {tab === 'meds'
        ? (meds.data ?? []).map((m) => (
            <Card key={m.id}>
              <Text weight="semibold">
                {m.name} {m.dose}
              </Text>
              <Text variant="caption" tone="muted">
                {m.frequency} · {m.route} · {m.indication}
              </Text>
            </Card>
          ))
        : null}

      {tab === 'allergies'
        ? (allergies.data ?? []).map((a) => (
            <Card key={a.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text weight="semibold">{a.substance}</Text>
                  <Text variant="caption" tone="muted">
                    {a.reaction}
                  </Text>
                </View>
                <Badge label={a.severity} tone={a.severity === 'anaphylaxis' || a.severity === 'severe' ? 'danger' : 'warning'} />
              </View>
            </Card>
          ))
        : null}

      {tab === 'vitals'
        ? (vitals.data ?? []).map((v) => (
            <Card key={v.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>{v.label}</Text>
                <Text weight="medium">
                  {v.value} {v.unit}
                </Text>
              </View>
              <Text variant="caption" tone="muted">
                {formatDateTime(v.effective)}
              </Text>
            </Card>
          ))
        : null}

      <Button
        label="Prescribe medication"
        onPress={() => navigation.navigate('Prescribe', { patientId: params.patientId })}
        style={{ marginTop: theme.spacing.md }}
      />
    </Screen>
  );
}
