import { Alert, Pressable, Switch, View } from 'react-native';

import { Badge, Button, Card, Screen, SectionHeader, Text } from '@/components/ui';
import { useTheme, ThemeMode } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { useSession } from '@/store/SessionContext';
import { MIN_TOUCH_TARGET } from '@/theme/tokens';

const MODES: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'highContrast', label: 'High contrast' },
];

const FONT_SCALES: { value: number; label: string }[] = [
  { value: 1, label: 'Default' },
  { value: 1.25, label: 'Large' },
  { value: 1.5, label: 'Larger' },
  { value: 2, label: 'Largest' },
];

export function MoreScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { secondsRemaining } = useSession();

  const chip = (active: boolean) => ({
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center' as const,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: active ? 2 : 1,
    borderColor: active ? theme.colors.primary : theme.colors.border,
    backgroundColor: active ? theme.colors.surfaceAlt : theme.colors.surface,
  });

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <Screen>
      <Card>
        <Text variant="title">{user?.displayName}</Text>
        <Text tone="muted">{user?.email}</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Badge
            label={theme.persona === 'provider' ? 'Clinical staff' : 'Patient member'}
            tone="info"
          />
          <Badge label={user?.role ?? 'user'} tone="neutral" />
          {user?.mfaEnrolled ? <Badge label="MFA on" tone="success" /> : <Badge label="MFA off" tone="warning" />}
        </View>
      </Card>

      <SectionHeader title="Appearance" />
      <Card>
        <Text weight="medium" style={{ marginBottom: theme.spacing.sm }}>
          Theme
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {MODES.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => theme.setMode(m.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: theme.mode === m.key }}
              accessibilityLabel={`${m.label} theme`}
              style={chip(theme.mode === m.key)}
            >
              <Text>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text weight="medium" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
          Text size
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {FONT_SCALES.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => theme.setFontScale(f.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: theme.fontScale === f.value }}
              accessibilityLabel={`${f.label} text size`}
              style={chip(theme.fontScale === f.value)}
            >
              <Text>{f.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionHeader title="Security & privacy" />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text weight="medium">Biometric unlock</Text>
            <Text variant="caption" tone="muted">
              Face ID / Touch ID. Biometric data never leaves your device.
            </Text>
          </View>
          <Switch value={user?.mfaEnrolled ?? false} disabled accessibilityLabel="Biometric unlock" />
        </View>
        <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md }} />
        <Text variant="caption" tone="muted">
          Auto-logoff in {mins}:{secs.toString().padStart(2, '0')} (resets on activity — HIPAA
          automatic logoff).
        </Text>
      </Card>

      <SectionHeader title="Emergency profile" />
      <Card
        onPress={() =>
          Alert.alert(
            'Emergency profile',
            'Blood type: O+\nAllergies: Penicillin (severe), Peanuts (anaphylaxis)\nConditions: Type 2 diabetes, Hypertension\n\nAvailable to first responders from the lock screen via QR in production.',
          )
        }
        accessibilityLabel="View emergency medical profile"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text weight="medium">Medical ID & emergency contacts</Text>
          <Text tone="muted">›</Text>
        </View>
      </Card>

      <Button
        label="Sign out"
        variant="danger"
        onPress={() =>
          Alert.alert('Sign out?', 'You’ll need to sign in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => signOut('user') },
          ])
        }
        style={{ marginTop: theme.spacing.lg }}
      />
    </Screen>
  );
}
