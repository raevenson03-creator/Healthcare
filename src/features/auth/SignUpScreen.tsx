import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Card, FadeInView, RoleOptionCard, Screen, Text, TextField } from '@/components/ui';
import type { DemoRole } from '@/components/ui/RoleOptionCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { evaluatePassword } from '@/security/password';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export function SignUpScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<DemoRole>('patient');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pwEval = evaluatePassword(password);

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!pwEval.valid) {
      setError('Password does not meet security requirements.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, role, displayName.trim());
      setSuccess('Account created. Check your email to verify, then sign in.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen variant="hero">
      <FadeInView>
        <Text variant="heading" tone="onPrimary">
          Create account
        </Text>
        <Text tone="onPrimary" style={{ opacity: 0.9, marginBottom: theme.spacing.md }}>
          Join CareBridge as a patient or provider.
        </Text>
      </FadeInView>

      <FadeInView delay={60}>
        <Card elevated={false} style={{ backgroundColor: theme.colors.surface }}>
          <View style={{ gap: theme.spacing.lg }}>
            {!isSupabaseConfigured() ? (
              <View
                style={{
                  backgroundColor: theme.colors.primaryMuted,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                }}
              >
                <Text variant="caption" tone="primary">
                  Registration requires Supabase. Configure keys in app.json, or use demo accounts on
                  the sign-in screen.
                </Text>
              </View>
            ) : null}

            <View>
              <Text variant="body" weight="semibold" style={{ marginBottom: theme.spacing.sm }}>
                I am a…
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <RoleOptionCard role="patient" selected={role === 'patient'} onPress={() => setRole('patient')} />
                <RoleOptionCard role="provider" selected={role === 'provider'} onPress={() => setRole('provider')} />
              </View>
            </View>

            <TextField
              label="Full name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              placeholder="Jordan Rivera"
            />
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
              textContentType="newPassword"
              placeholder="Min. 12 characters"
              helperText={
                password.length > 0
                  ? pwEval.valid
                    ? 'Password meets requirements'
                    : `Missing: ${pwEval.failed.map((r) => r.label.toLowerCase()).join(', ')}`
                  : 'Use 12+ chars with upper, lower, number & symbol'
              }
            />

            {error ? (
              <Text tone="danger" accessibilityLiveRegion="assertive">
                {error}
              </Text>
            ) : null}
            {success ? (
              <Text tone="success" accessibilityLiveRegion="polite">
                {success}
              </Text>
            ) : null}

            <View style={{ gap: theme.spacing.sm }}>
              <Button
                label="Sign up"
                onPress={onSubmit}
                loading={submitting}
                disabled={!isSupabaseConfigured()}
              />
              <Button label="Back to sign in" variant="outline" onPress={() => navigation.navigate('Login')} />
            </View>
          </View>
        </Card>
      </FadeInView>
    </Screen>
  );
}
