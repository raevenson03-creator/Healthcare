import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Button,
  Card,
  FadeInView,
  PulseGlow,
  RoleOptionCard,
  Screen,
  Text,
  TextField,
} from '@/components/ui';
import type { DemoRole } from '@/components/ui/RoleOptionCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { authenticateWithBiometrics, isBiometricAvailable } from '@/security/biometrics';
import { DEMO_CREDENTIALS } from '@/services/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null);
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
      fillDemo('patient');
      await signIn(DEMO_CREDENTIALS.patient.email, DEMO_CREDENTIALS.patient.password);
    }
  };

  const fillDemo = (role: DemoRole) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setError(null);
  };

  return (
    <Screen variant="hero">
      <FadeInView delay={0}>
        <View style={{ alignItems: 'center', marginVertical: theme.spacing.lg, position: 'relative' }}>
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
        <Card elevated={false} style={{ backgroundColor: theme.colors.surface }}>
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

            <View style={{ gap: theme.spacing.sm }}>
              <Button
                label="Sign in"
                onPress={onSubmit}
                loading={submitting}
                variant="primary"
                accessibilityHint="Signs you in and starts multi-factor verification"
              />
              <Button
                label="Create account"
                onPress={() => navigation.navigate('SignUp')}
                variant="outline"
                accessibilityHint="Opens registration to create a new account"
              />
            </View>

            <Pressable onPress={onBiometric} accessibilityRole="link" accessibilityLabel="Use Face ID or Touch ID">
              <Text tone="primary" weight="medium" style={{ textAlign: 'center' }}>
                Use Face ID / Touch ID
              </Text>
            </Pressable>
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={160}>
        <Card elevated={false} style={{ marginTop: theme.spacing.md, backgroundColor: theme.colors.surface }}>
          <View style={{ gap: theme.spacing.md }}>
            <View>
              <Text variant="body" weight="bold">
                Quick access
              </Text>
              <Text variant="caption" tone="muted">
                Select a portal to autofill demo credentials (synthetic data only).
                {isSupabaseConfigured() ? ' Connected to Supabase.' : ' Using local mock data.'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <RoleOptionCard
                role="patient"
                selected={selectedRole === 'patient'}
                onPress={() => fillDemo('patient')}
              />
              <RoleOptionCard
                role="provider"
                selected={selectedRole === 'provider'}
                onPress={() => fillDemo('provider')}
              />
            </View>

            {selectedRole ? (
              <View
                style={{
                  backgroundColor: theme.colors.primaryMuted,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  gap: 2,
                }}
              >
                <Text variant="caption" weight="semibold" tone="primary">
                  Demo credentials loaded
                </Text>
                <Text variant="caption" tone="muted">
                  {DEMO_CREDENTIALS[selectedRole].email}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      </FadeInView>
    </Screen>
  );
}
