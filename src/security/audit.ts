import * as Crypto from 'expo-crypto';

import { env } from '@/config/env';
import { getSecureItem } from './secureStorage';

/**
 * Audit logging (spec 1.1 "Audit Controls", 13.3).
 *
 * Every PHI access / modification and every auth event must be recorded with
 * who / what / when / where. On-device we buffer entries and flush them to the
 * backend audit sink over TLS. The backend is the system of record (immutable,
 * WORM storage, 7-year retention). This client buffer is a durability aid, not
 * the authoritative log.
 */

export type AuditAction =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.signup.success'
  | 'auth.signup.failure'
  | 'auth.logout'
  | 'auth.mfa.challenge'
  | 'auth.session.timeout'
  | 'phi.view'
  | 'phi.create'
  | 'phi.update'
  | 'phi.delete'
  | 'phi.export'
  | 'breakglass.invoke';

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actorId: string | null;
  actorRole: string | null;
  /** What was touched, e.g. "Patient/123", "Observation/abc". */
  resource?: string;
  /** Free-form context (never include raw PHI values). */
  detail?: string;
  timestamp: string;
}

type Sink = (event: AuditEvent) => Promise<void> | void;

let buffer: AuditEvent[] = [];
let sink: Sink | null = null;

/** Wire a transport (e.g. an API client) that ships events to the backend. */
export function configureAuditSink(fn: Sink): void {
  sink = fn;
}

export async function audit(
  action: AuditAction,
  opts: { resource?: string; detail?: string } = {},
): Promise<void> {
  const actorId = await getSecureItem('audit.actorId').catch(() => null);
  const actorRole = await getSecureItem('audit.actorRole').catch(() => null);

  const event: AuditEvent = {
    id: Crypto.randomUUID(),
    action,
    actorId,
    actorRole,
    resource: opts.resource,
    detail: opts.detail,
    timestamp: new Date().toISOString(),
  };

  buffer.push(event);
  try {
    await sink?.(event);
    buffer = buffer.filter((e) => e.id !== event.id);
  } catch {
    // Keep in buffer; a background flush will retry. Never block the UX.
  }
}

/** Retry shipping any buffered events (call on reconnect / app foreground). */
export async function flushAuditBuffer(): Promise<void> {
  if (!sink || buffer.length === 0) return;
  const pending = [...buffer];
  for (const event of pending) {
    try {
      await sink(event);
      buffer = buffer.filter((e) => e.id !== event.id);
    } catch {
      break; // Stop on first failure; preserve order for next attempt.
    }
  }
}

/** Test/support helper. */
export function _getAuditBuffer(): AuditEvent[] {
  return [...buffer];
}

// Referenced to document intended endpoint; kept for discoverability.
export const AUDIT_ENDPOINT = `${env.apiBaseUrl}/v1/audit-events`;
