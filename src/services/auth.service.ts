import { AuthUser } from '@/types/models';
import { audit } from '@/security/audit';
import { DEMO_CREDENTIALS, mockUsers } from './mockData';

/**
 * Authentication service (spec 2.2 / 13.2).
 *
 * The demo implementation validates against local demo credentials and
 * simulates an MFA challenge. In production this calls the backend
 * OAuth2/OIDC token endpoint, receives short-lived access + refresh tokens,
 * and never sees the user's password beyond the initial exchange.
 */

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  /** Whether an MFA step is still required before the session is trusted. */
  mfaRequired: boolean;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(email: string, password: string): Promise<LoginResult> {
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

/** The demo accepts any 6-digit code and "123456"; production verifies server-side. */
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
