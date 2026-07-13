# CareBridge Health — React Native (Expo) Reference App

A HIPAA-minded, accessibility-first healthcare mobile app foundation for **patients** and **providers**, implemented in **React Native + Expo + TypeScript**.

This repository is a working, extensible foundation that demonstrates the
architecture, security posture, UX patterns, and core feature set described in
the *Healthcare Mobile App Requirements Specification*. It runs end-to-end
against a **synthetic (non-PHI) mock data layer** so you can explore the flows
without a backend, while the service interfaces mirror the real FHIR/OAuth
contracts so the mock can be swapped for live systems with minimal UI changes.

> ⚠️ **Not for production use as-is.** Several controls (TLS certificate
> pinning, real OAuth2/OIDC, EHR/Surescripts integration, server-side audit
> sink, WebRTC telehealth, push notifications) are represented by clearly
> marked stubs/interfaces. See `docs/COMPLIANCE.md` for the full "what's real
> vs. what the backend owns" matrix.

---

## Quick start

Requires Node 18+, and the Expo tooling. On a machine **with network access**:

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with
Expo Go.

> Dependency versions target **Expo SDK 52**. If `npm install` complains about
> version mismatches, run `npx expo install` to align native packages to the
> installed SDK.

### Demo accounts (synthetic data only)

| Role     | Email                   | Password             |
| -------- | ----------------------- | -------------------- |
| Patient  | `patient@demo.health`   | `DemoPatient#2026`   |
| Provider | `provider@demo.health`  | `DemoProvider#2026`  |

The Login screen has one-tap buttons to autofill these. Any 6-digit code passes
the MFA step in the demo.

---

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm start`         | Start the Expo dev server                |
| `npm run typecheck` | `tsc --noEmit` type checking             |
| `npm run lint`      | ESLint over `.ts`/`.tsx`                 |
| `npm test`          | Jest unit + component tests              |

---

## What's implemented

**Cross-cutting**
- Accessible design system (`src/components/ui`) — themed `Text`, `Button`,
  `Card`, `Badge`, `TextField`, `Screen`, all with ≥44pt touch targets and a11y roles.
- Theming with **light / dark / high-contrast** palettes and **dynamic text
  scaling up to 2×** (WCAG 2.1 AA — spec 1.4), persisted locally.
- **RBAC** permission model with a `patient` vs `provider` app shell (spec 2.1).
- **HIPAA automatic logoff**: 15-min idle + 8-hr absolute session timeout,
  reset on any touch (spec 1.1 / 13.2).
- **Hardware-backed secure storage** (Keychain/Keystore) for tokens & session.
- **Audit logging** util that records who/what/when for every PHI access.
- **Biometric** unlock (Face ID / Touch ID) via the OS secure enclave.
- **Password policy** validator (spec 2.2).

**Patient experience**
- Dashboard (upcoming appts, today's meds, flagged results, vitals snapshot, quick actions).
- Appointment self-scheduling (visit type, provider, time slot, reason) + detail/cancel + telehealth join stub.
- Health records (allergies, conditions, vitals, lab results with abnormal flags).
- Medication reminders with dose check-off, adherence %, and refill requests.
- Secure messaging threads with a conversation view.
- Settings: theme, text size, emergency profile, biometric toggle, sign-out.

**Provider experience**
- Today dashboard (task queue + schedule).
- Patient chart (summary / problems / meds / allergies / vitals tabs).
- **E-prescribing with live Clinical Decision Support** — drug–drug interactions,
  drug–allergy conflicts, duplicate therapy, and contraindication override flow (spec 4.3 / 8.1).
- Schedule grouped by day.

---

## Architecture

```
App.tsx                    Providers: Gesture → SafeArea → Theme → Auth → Session → Navigation
index.ts                   Expo entry

src/
  theme/                   Palettes, tokens, ThemeProvider (mode + font scale)
  config/                  Runtime env (API/FHIR base URLs, timeouts)
  types/                   FHIR-shaped domain models + roles/permissions
  security/                secureStorage, rbac, audit, biometrics, password
  services/                api client, auth, clinical (mock), CDS engine, mock data
  store/                   AuthContext (auth state) + SessionContext (idle logoff)
  navigation/              Root → Auth | Patient tabs | Provider tabs (typed)
  components/ui/           Accessible design-system primitives
  features/                Screens grouped by role/domain
  hooks/                   useAsync data-loading helper
  utils/                   formatting helpers
```

See **`docs/ARCHITECTURE.md`** for data flow, the backend/integration boundary,
and how to swap the mock layer for live FHIR/OAuth. See **`docs/COMPLIANCE.md`**
for the requirement-by-requirement mapping.

---

## Testing

Pure logic (RBAC, password policy, CDS engine, formatters) and a sample
component test are covered by Jest (`jest-expo` preset) with
`@testing-library/react-native`. Native modules (SecureStore, LocalAuthentication,
Crypto) are mocked in `jest.setup.ts`.

```bash
npm test
```
