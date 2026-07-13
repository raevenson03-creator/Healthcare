import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/security/biometrics';
import { DEMO_CREDENTIALS } from '@/services/mockData';

export function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const onBiometric = async () => {
    const available = await isBiometricAvailable();
    if (!available) {
      setError('Biometric sign-in is not set up on this device.');
      return;
    }
    const ok = await authenticateWithBiometrics('Sign in to CareBridge');
    if (ok) {
      // Demo: biometric unlock signs in the patient profile.
      await signIn(DEMO_CREDENTIALS.patient.email, DEMO_CREDENTIALS.patient.password);
    }
  };

  const fillDemo = (role: 'patient' | 'provider') => {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginVertical: theme.spacing.xl }}>
        <Text variant="display" tone="primary" weight="bold">
          CareBridge
        </Text>
        <Text variant="body" tone="muted">
          Secure access to your health
        </Text>
      </View>

      <Card>
        <View style={{ gap: theme.spacing.lg }}>
          <Text variant="title">Sign in</Text>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="username"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="••••••••••••"
          />
          {error ? (
            <Text tone="danger" accessibilityLiveRegion="assertive">
              {error}
            </Text>
          ) : null}
          <Button label="Sign in" onPress={onSubmit} loading={submitting} accessibilityHint="Signs you in and starts multi-factor verification" />
          <Button label="Use Face ID / Touch ID" variant="ghost" onPress={onBiometric} />
        </View>
      </Card>

      <Card style={{ marginTop: theme.spacing.md }}>
        <Text variant="body" weight="semibold">
          Demo accounts
        </Text>
        <Text variant="caption" tone="muted" style={{ marginBottom: theme.spacing.sm }}>
          Tap to autofill (synthetic data only — no real PHI).
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button label="Patient" variant="secondary" fullWidth={false} onPress={() => fillDemo('patient')} style={{ flex: 1 }} />
          <Button label="Provider" variant="secondary" fullWidth={false} onPress={() => fillDemo('provider')} style={{ flex: 1 }} />
        </View>
      </Card>
    </Screen>
  );
}
