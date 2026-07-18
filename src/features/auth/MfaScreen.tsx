import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/store/AuthContext';
import { requestMfaCode } from '@/services/auth.service';

export function MfaScreen() {
  const theme = useTheme();
  const { confirmMfa, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    requestMfaCode().then((r) => setChannel(r.channel)).catch(() => undefined);
  }, []);

  const onVerify = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await confirmMfa(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={{ marginTop: theme.spacing.xxl }} />
      <Card>
        <View style={{ gap: theme.spacing.lg }}>
          <Text variant="title">Verify it’s you</Text>
          <Text tone="muted">
            We sent a 6-digit code via {channel || 'your registered method'}. Enter it below to
            continue.
          </Text>
          <TextField
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            textContentType="oneTimeCode"
            helperText="Demo tip: any 6 digits will work."
          />
          {error ? (
            <Text tone="danger" accessibilityLiveRegion="assertive">
              {error}
            </Text>
          ) : null}
          <Button label="Verify & continue" onPress={onVerify} loading={submitting} />
          <Button label="Cancel" variant="ghost" onPress={() => signOut('user')} />
        </View>
      </Card>
    </Screen>
  );
}
