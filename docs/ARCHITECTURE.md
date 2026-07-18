# Architecture

## 1. High-level shape

CareBridge is a **client-thin, server-authoritative** healthcare app. The mobile
client renders UX, enforces defense-in-depth security (RBAC, idle logoff, secure
storage), and talks to backend services over TLS. All authoritative
enforcement — access control, audit of record, PHI storage, clinical databases,
integrations — lives on the backend.

```
┌───────────────────────────────────────────────────────────────┐
│                        Mobile client (this repo)                │
│                                                                 │
│  UI (design system + screens)                                   │
│      │                                                          │
│  Contexts (Auth, Session, Theme)                                │
│      │                                                          │
│  Services (auth, clinical, CDS)  ── mock now / FHIR+REST later  │
│      │                                                          │
│  Security (secureStorage, rbac, audit, biometrics)              │
└───────────────────────────────┬─────────────────────────────────┘
                                 │  HTTPS / TLS 1.3 (+ cert pinning)
                                 ▼
┌───────────────────────────────────────────────────────────────┐
│                     Backend (out of scope here)                 │
│  API Gateway → microservices (user, patient, appointment, EHR,  │
│  medication, billing, notification, telehealth, analytics)      │
│  PostgreSQL · Redis · Elasticsearch · TimescaleDB · Kafka       │
│  HAPI/Azure FHIR server (R4) · SMART on FHIR                    │
│                                                                 │
│  Integrations: Epic/Cerner · Quest/LabCorp · Surescripts ·      │
│  PDMP · PACS/DICOM · Apple Health/Google Fit/Dexcom             │
└───────────────────────────────────────────────────────────────┘
```

## 2. Provider composition (`App.tsx`)

`GestureHandlerRootView → SafeAreaProvider → ThemeProvider → AuthProvider →
SessionProvider → RootNavigator`.

- **ThemeProvider** resolves mode (system/light/dark/high-contrast) and font
  scale, persisting non-PHI prefs to AsyncStorage.
- **AuthProvider** owns auth state (`loading | signedOut | mfaPending | signedIn`),
  restores sessions from secure storage on cold start, and exposes
  `signIn / confirmMfa / signOut`.
- **SessionProvider** runs the HIPAA idle + absolute logoff timers. `RootNavigator`
  wraps everything in a capture-phase touch handler that calls `reportActivity()`
  so any interaction resets the idle clock.

## 3. Navigation

`RootNavigator` branches on auth status and role:

- Not signed in → `AuthNavigator` (`Login` ↔ `Mfa`).
- Signed in + provider role → `ProviderNavigator` (bottom tabs: Today / Schedule /
  Messages / More; Today is a stack → chart → prescribe).
- Signed in + patient role → `PatientNavigator` (bottom tabs: Home / Appointments /
  Records / Messages / More; Appointments & Records are nested stacks).

All param lists are typed in `src/navigation/types.ts`.

## 4. Data & services

Screens never call `fetch` directly. They call **service functions** and use the
`useAsync` hook for loading/error/reload. Today the services return synthetic
data from `mockData.ts`; the interfaces already match FHIR:

| Service fn                | Production call                                        |
| ------------------------- | ------------------------------------------------------ |
| `getPatient(id)`          | `GET /fhir/Patient/{id}`                               |
| `getAppointments(pid)`    | `GET /fhir/Appointment?patient={pid}`                  |
| `bookAppointment(a)`      | `POST /fhir/Appointment`                               |
| `getMedications(pid)`     | `GET /fhir/MedicationRequest?patient={pid}`            |
| `getVitals(pid)`          | `GET /fhir/Observation?patient={pid}&category=vital-signs` |
| `getLabReports(pid)`      | `GET /fhir/DiagnosticReport?patient={pid}`             |
| `getConditions(pid)`      | `GET /fhir/Condition?patient={pid}`                    |
| `getAllergies(pid)`       | `GET /fhir/AllergyIntolerance?patient={pid}`           |

`src/services/api/client.ts` is the real HTTP client (bearer token from secure
storage, FHIR/JSON content types). To go live, reimplement the clinical service
bodies with `request(...)` and delete `mockData` usage.

## 5. Clinical Decision Support

`src/services/clinicalDecisionSupport.ts` is a pure, unit-tested rules engine
(interactions, allergy cross-reactivity, duplicate therapy) with a small
illustrative dataset. In production it fronts a licensed drug database
(First Databank / Medi-Span); the function signatures stay the same so the
`PrescribeScreen` UI is unchanged.

## 6. Offline & sync (roadmap)

The `useAsync` + service seam is where an offline cache belongs. Recommended:
- Persist non-sensitive reference data + queued writes in a local store
  (SQLite/WatermelonDB or MMKV). Encrypt any cached PHI.
- Queue mutations (booking, dose logs, messages) and replay on reconnect with
  conflict detection; flush the audit buffer (`flushAuditBuffer`) on foreground.

## 7. Extending

- **New feature** → add a service fn (+ mock), a screen under
  `src/features/...`, and wire it into the relevant navigator.
- **New role** → add to `UserRole`/`ROLE_PERMISSIONS`, decide patient vs provider
  shell in `PROVIDER_ROLES`.
- **Design change** → adjust `theme/palette.ts` / `theme/tokens.ts`; every
  component reads from the theme.
