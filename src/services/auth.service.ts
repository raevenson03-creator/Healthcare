import { AuthUser } from '@/types/models';
import { audit } from '@/security/audit';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { mapProfile } from '@/services/supabase/mappers';
import { DEMO_CREDENTIALS, mockUsers } from './mockData';

/**
 * Authentication service (spec 2.2 / 13.2).
 *
 * Uses Supabase Auth when configured; otherwise validates against local demo
 * credentials. Production should use OAuth2/OIDC with short-lived tokens.
 */

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  /** Whether an MFA step is still required before the session is trusted. */
  mfaRequired: boolean;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loginWithMock(email: string, password: string): Promise<LoginResult> {
  await delay(600);
  const normalized = email.trim().toLowerCase();

  const match =
    normalized === DEMO_CREDENTIALS.patient.email && password === DEMO_CREDENTIALS.patient.password
      ? mockUsers.patient
      : normalized === DEMO_CREDENTIALS.provider.email &&
          password === DEMO_CREDENTIALS.provider.password
        ? mockUsers.provider
        : null;

  if (!match) {
    await audit('auth.login.failure', { detail: `email=${normalized}` });
    throw new Error('Invalid email or password.');
  }

  await audit('auth.login.success', { resource: `User/${match.id}` });
  return {
    user: match,
    accessToken: `demo-access-${match.id}-${Date.now()}`,
    refreshToken: `demo-refresh-${match.id}`,
    mfaRequired: match.mfaEnrolled,
  };
}

async function loginWithSupabase(email: string, password: string): Promise<LoginResult> {
  const supabase = getSupabase();
  const normalized = email.trim().toLowerCase();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (authError || !authData.session || !authData.user) {
    await audit('auth.login.failure', { detail: `email=${normalized}` });
    throw new Error('Invalid email or password.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new Error('User profile not found. Run scripts/setup-demo-users.mjs.');
  }

  const user = mapProfile(profile);
  await audit('auth.login.success', { resource: `User/${user.id}` });

  return {
    user,
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    mfaRequired: user.mfaEnrolled,
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (!isSupabaseConfigured()) {
    return loginWithMock(email, password);
  }
  return loginWithSupabase(email, password);
}

/** The demo accepts any 6-digit code; production verifies server-side. */
export async function verifyMfa(code: string): Promise<boolean> {
  await delay(400);
  await audit('auth.mfa.challenge');
  return /^\d{6}$/.test(code);
}

/** Simulated OTP dispatch — a real backend sends SMS/email or uses TOTP. */
export async function requestMfaCode(): Promise<{ channel: string }> {
  await delay(300);
  return { channel: 'SMS to •••• 2233' };
}

export async function signOutSupabase(): Promise<void> {
  if (isSupabaseConfigured()) {
    await getSupabase().auth.signOut();
  }
}
