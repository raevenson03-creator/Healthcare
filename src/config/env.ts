import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  fhirBaseUrl?: string;
  sessionIdleTimeoutMs?: number;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Central runtime configuration. Values come from app.json `extra` and can be
 * overridden per environment (dev/staging/prod) via EAS build profiles.
 *
 * NOTE: Never place secrets (API keys, client secrets) here — the bundle is
 * shippable to devices. Secrets belong on the backend / secret manager.
 */
export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'https://api.example-carebridge.com',
  fhirBaseUrl: extra.fhirBaseUrl ?? 'https://fhir.example-carebridge.com/r4',
  /** HIPAA automatic logoff: 15 minutes of inactivity (spec 1.1). */
  sessionIdleTimeoutMs: extra.sessionIdleTimeoutMs ?? 15 * 60 * 1000,
  /** Absolute session cap regardless of activity (spec 13.2): 8 hours. */
  sessionAbsoluteTimeoutMs: 8 * 60 * 60 * 1000,
} as const;
