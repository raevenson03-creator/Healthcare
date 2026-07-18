import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Badge, Button, Card, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useAsync } from '@/hooks/useAsync';
import { getMessageThreads } from '@/services/clinical.service';
import { relativeTime } from '@/utils/format';

interface LocalMessage {
  id: string;
  fromMe: boolean;
  body: string;
  at: string;
}

const SEED: Record<string, LocalMessage[]> = {
  'thread-1': [
    { id: 'm1', fromMe: false, body: 'Your morning glucose is trending high. How are you feeling?', at: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'm2', fromMe: true, body: 'A bit tired but otherwise okay.', at: new Date(Date.now() - 2.5 * 3600000).toISOString() },
    { id: 'm3', fromMe: false, body: 'Let’s adjust your evening dose. Please monitor for a week.', at: new Date(Date.now() - 2 * 3600000).toISOString() },
  ],
  'thread-2': [
    { id: 'm4', fromMe: false, body: 'Your CMP results are available to review.', at: new Date(Date.now() - 30 * 3600000).toISOString() },
  ],
};

export function MessagesScreen() {
  const theme = useTheme();
  const { data } = useAsync(() => getMessageThreads(), []);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, LocalMessage[]>>(SEED);
  const [draft, setDraft] = useState('');

  const threads = data ?? [];

  if (activeThread) {
    const thread = threads.find((t) => t.id === activeThread);
    const convo = messages[activeThread] ?? [];
    const send = () => {
      if (!draft.trim()) return;
      const msg: LocalMessage = { id: `local-${Date.now()}`, fromMe: true, body: draft.trim(), at: new Date().toISOString() };
      setMessages((prev) => ({ ...prev, [activeThread]: [...(prev[activeThread] ?? []), msg] }));
      setDraft('');
    };

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View style={{ padding: theme.spacing.lg, paddingTop: theme.spacing.xxl, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
            <Pressable onPress={() => setActiveThread(null)} accessibilityRole="button" accessibilityLabel="Back to messages">
              <Text tone="primary">‹ Messages</Text>
            </Pressable>
            <Text variant="title">{thread?.participantName}</Text>
            <Text variant="caption" tone="muted">
              {thread?.subject} · End-to-end encrypted
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
            {convo.map((m) => (
              <View
                key={m.id}
                accessible
                accessibilityLabel={`${m.fromMe ? 'You' : thread?.participantName}: ${m.body}`}
                style={{
                  alignSelf: m.fromMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: m.fromMe ? theme.colors.primary : theme.colors.surface,
                  borderWidth: m.fromMe ? 0 : 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing.md,
                }}
              >
                <Text tone={m.fromMe ? 'onPrimary' : 'default'}>{m.body}</Text>
                <Text variant="caption" tone={m.fromMe ? 'onPrimary' : 'muted'} style={{ marginTop: 4 }}>
                  {relativeTime(m.at)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextField label="" value={draft} onChangeText={setDraft} placeholder="Type a secure message…" multiline />
            </View>
            <Button label="Send" fullWidth={false} onPress={send} disabled={!draft.trim()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Screen>
      <Text variant="heading">Messages</Text>
      <Text tone="muted">Secure, HIPAA-compliant messaging with your care team.</Text>
      {threads.map((t) => (
        <Card
          key={t.id}
          onPress={() => setActiveThread(t.id)}
          accessibilityLabel={`Conversation with ${t.participantName}, subject ${t.subject}. ${t.unreadCount} unread.`}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyLarge" weight="semibold">
                {t.participantName}
              </Text>
              <Text weight="medium">{t.subject}</Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {t.lastMessagePreview}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text variant="caption" tone="muted">
                {relativeTime(t.lastMessageAt)}
              </Text>
              {t.unreadCount > 0 ? <Badge label={String(t.unreadCount)} tone="info" /> : null}
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
