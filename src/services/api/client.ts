import { env } from '@/config/env';
import { getSecureItem, SecureKeys } from '@/security/secureStorage';

/**
 * Thin HTTP client for backend/FHIR calls.
 *
 * Security posture (spec 13.1/13.2):
 *  - All traffic is HTTPS (TLS 1.3 enforced by the server + ATS/cleartext-off).
 *  - Bearer access token attached from hardware-backed secure storage.
 *  - In production, enable TLS certificate pinning at the native layer
 *    (e.g. react-native-ssl-pinning / Expo config plugin) — see docs.
 *
 * This client is intentionally not exercised by the mock service layer used in
 * the demo build, but shows the exact contract the real services implement.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  base?: 'api' | 'fhir';
  signal?: AbortSignal;
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, base = 'api', signal } = opts;
  const root = base === 'fhir' ? env.fhirBaseUrl : env.apiBaseUrl;
  const token = await getSecureItem(SecureKeys.accessToken);

  const res = await fetch(`${root}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': base === 'fhir' ? 'application/fhir+json' : 'application/json',
      Accept: base === 'fhir' ? 'application/fhir+json' : 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${method} ${path} -> ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
