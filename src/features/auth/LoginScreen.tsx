import { useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, FadeInView, PulseGlow, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/security/biometrics';
import { DEMO_CREDENTIALS } from '@/services/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';

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
      await signIn(DEMO_CREDENTIALS.patient.email, DEMO_CREDENTIALS.patient.password);
    }
  };

  const fillDemo = (role: 'patient' | 'provider') => {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  return (
    <Screen variant="hero">
      <FadeInView delay={0}>
        <View style={{ alignItems: 'center', marginVertical: theme.spacing.xl, position: 'relative' }}>
          <PulseGlow color={theme.colors.onPrimary} size={160} />
          <LinearGradient
            colors={[theme.colors.onPrimary, theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radius.lg,
              marginBottom: theme.spacing.md,
            }}
          >
            <Text variant="display" tone="onPrimary" weight="bold" style={{ textAlign: 'center' }}>
              CareBridge
            </Text>
          </LinearGradient>
          <Text variant="body" tone="onPrimary" style={{ opacity: 0.9 }}>
            Secure access to your health
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={80}>
        <Card elevated style={{ borderColor: 'transparent' }}>
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
            <Button
              label="Sign in"
              onPress={onSubmit}
              loading={submitting}
              accessibilityHint="Signs you in and starts multi-factor verification"
            />
            <Button label="Use Face ID / Touch ID" variant="ghost" onPress={onBiometric} />
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={160}>
        <Card elevated style={{ marginTop: theme.spacing.md }}>
          <Text variant="body" weight="semibold">
            Demo accounts
          </Text>
          <Text variant="caption" tone="muted" style={{ marginBottom: theme.spacing.sm }}>
            Tap to autofill (synthetic data only — no real PHI).
            {isSupabaseConfigured() ? ' Connected to Supabase.' : ' Using local mock data.'}
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button
              label="Patient"
              variant="secondary"
              fullWidth={false}
              onPress={() => fillDemo('patient')}
              style={{ flex: 1 }}
            />
            <Button
              label="Provider"
              variant="secondary"
              fullWidth={false}
              onPress={() => fillDemo('provider')}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </FadeInView>
    </Screen>
  );
}
