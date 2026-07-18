# Compliance & Requirements Mapping

This maps the *Healthcare Mobile App Requirements Specification* to what exists
in this repo, and — critically — what a real deployment still owns on the
backend/native side. Nothing here should be read as a certification; it is an
engineering traceability aid.

Legend: ✅ implemented in client · 🟡 stub/interface present · 🔴 backend/native responsibility

## 1. Regulatory & Compliance

| Req | Status | Where / Notes |
| --- | --- | --- |
| 1.1 Encryption at rest (AES-256) | 🟡/🔴 | Client secrets in Keychain/Keystore via `security/secureStorage.ts`. Full DB/file AES-256 + KMS is backend. |
| 1.1 Encryption in transit (TLS 1.3) | 🟡 | `api/client.ts` uses HTTPS; enforce TLS 1.3 + **certificate pinning** at native layer (config plugin) before production. |
| 1.1 RBAC / minimum necessary | ✅ | `types/roles.ts`, `security/rbac.ts`, role-based navigator split. |
| 1.1 Audit controls | ✅/🔴 | `security/audit.ts` records who/what/when for every PHI read/write + auth event. Ships to backend WORM store (system of record). |
| 1.1 Automatic logoff (15 min) | ✅ | `store/SessionContext.tsx` idle timer + `config/env.ts`. |
| 1.1 Unique user identification | ✅ | Each `AuthUser` has a unique id; actor stamped on audit events. |
| 1.1 Emergency/break-glass access | 🟡 | Permission `breakglass:invoke` + audit action defined; UI flow is a backend-gated feature. |
| 1.2 GDPR (consent, erasure, portability) | 🟡 | Consent/rights are modeled conceptually; data export (CCDA/FHIR) & erasure are backend endpoints. |
| 1.3 FDA / SaMD | 🔴 | Governance/clinical validation — organizational, not code. |
| 1.4 WCAG 2.1 AA | ✅ | High-contrast palette, dynamic text to 2×, ≥44pt targets, roles/labels, live regions. VoiceOver/TalkBack compatible. |

## 2. Authentication

| Req | Status | Where / Notes |
| --- | --- | --- |
| MFA | ✅/🟡 | `AuthContext` enforces an MFA step post-login; demo verifier in `auth.service.ts`. Real OTP/TOTP/hardware token server-side. |
| Password policy (12+, classes, etc.) | ✅/🔴 | Strength: `security/password.ts`. Expiration/history/lockout are server state. |
| Biometric (local only) | ✅ | `security/biometrics.ts` (expo-local-authentication); templates never leave device. |
| SSO (OAuth2/OIDC/SAML) | 🟡 | `api/client.ts` is bearer-token ready; wire to IdP + refresh tokens. |
| Session mgmt (15m access / refresh / 8h absolute) | ✅/🟡 | Idle+absolute timeouts client-side; token lifetimes enforced by auth server. |

## 3–4. Patient & Provider features

| Req | Status | Where |
| --- | --- | --- |
| 3.2 Patient dashboard | ✅ | `features/patient/DashboardScreen.tsx` |
| 3.3 Profile / settings | ✅ | `features/shared/MoreScreen.tsx` |
| 4.1 Provider dashboard + task queue | ✅ | `features/provider/ProviderDashboardScreen.tsx` |
| 4.2 EHR chart (demographics/problems/meds/allergies/vitals/labs) | ✅ | `features/provider/PatientChartScreen.tsx`, patient `records/*` |
| 4.3 Clinical decision support | ✅ | `services/clinicalDecisionSupport.ts` + `PrescribeScreen.tsx` |

## 5. Medical records / interoperability

| Req | Status | Where |
| --- | --- | --- |
| FHIR-shaped models | ✅ | `types/models.ts` (Patient/Appointment/Observation/MedicationRequest/Condition/AllergyIntolerance/Communication) |
| HL7 FHIR R4 exchange | 🟡 | `api/client.ts` `base:'fhir'` path; server = HAPI/Azure FHIR |
| CCDA / HIE / Epic/Cerner/labs/PACS | 🔴 | Backend integration services |

## 6–7. Scheduling & Telemedicine

| Req | Status | Where |
| --- | --- | --- |
| Patient self-scheduling | ✅ | `appointments/BookAppointmentScreen.tsx` |
| Reschedule / cancel | ✅ | `appointments/AppointmentDetailScreen.tsx` |
| Video visit (WebRTC/SRTP, device test) | 🟡 | Join entry point + described flow; integrate a HIPAA-eligible WebRTC SDK |
| RPM / device & wearable sync | 🟡 | Vitals screen notes HealthKit/Health Connect/BLE; native modules to add |

## 8–9. Medication & Monitoring

| Req | Status | Where |
| --- | --- | --- |
| E-prescribing + Surescripts | ✅ UI / 🔴 network | `PrescribeScreen.tsx` (send stub) |
| Interaction/allergy/duplicate/dose checks | ✅ | `clinicalDecisionSupport.ts` |
| Adherence tracking & refills | ✅ | `features/patient/MedicationsScreen.tsx` |
| Vitals & chronic disease tracking | ✅ | `records/VitalsScreen.tsx`, dashboard metrics |

## 10–12. Emergency / Notifications / Payments

| Req | Status | Where |
| --- | --- | --- |
| Emergency profile / Medical ID | ✅ | `MoreScreen.tsx` (QR/lock-screen = native) |
| Notifications (push/SMS/email, quiet hours) | 🔴 | Backend + `expo-notifications`/FCM/APNs; preferences model TODO |
| Payments / insurance / price transparency | 🔴 | PCI-scoped backend + processor SDK |

## 13. Security & Privacy

| Req | Status | Where |
| --- | --- | --- |
| Secure storage | ✅ | `security/secureStorage.ts` |
| RBAC + minimum necessary | ✅ | `security/rbac.ts` |
| Audit + anomaly detection | ✅ client / 🔴 detection | `security/audit.ts`; anomaly detection is backend |
| Consent management / patient rights | 🟡 | Modeled; flows are backend-driven |

## 14–17. Architecture / Integration / UI / Performance

| Req | Status | Where |
| --- | --- | --- |
| RN (Expo) TS app, iOS 15+/Android 10+ | ✅ | `app.json`, `package.json` (SDK 52 / RN 0.76) |
| Design system + accessibility | ✅ | `components/ui/*`, `theme/*` |
| Offline + sync | 🟡 | Seam via `useAsync` + services; see ARCHITECTURE §6 |

## 18. Testing & QA

| Req | Status | Where |
| --- | --- | --- |
| Unit tests (security, CDS, utils) | ✅ | `src/**/__tests__/*` |
| Component tests | ✅ | `components/ui/__tests__/Button.test.tsx` |
| Security/pen testing, WCAG audit, E2E (Detox), regulatory validation | 🔴 | Add Detox + axe/manual VoiceOver/TalkBack audits + 3rd-party pen test in CI |

---

## Production hardening checklist (before handling real PHI)

1. Replace mock services with FHIR/REST calls; wire OAuth2/OIDC + refresh tokens.
2. Enable **TLS certificate pinning** and disable cleartext traffic (ATS / network security config).
3. Stand up the **server-side audit sink** (immutable/WORM, 7-yr retention) and point `configureAuditSink`.
4. Add **jailbreak/root detection**, screenshot/backgrounding privacy blur, and screen-recording protection for PHI screens.
5. Sign **BAAs** with all vendors; deploy on HIPAA-eligible infra; obtain SOC 2 / HITRUST.
6. Add push notifications, telehealth WebRTC, device/wearable integrations, and payments (PCI).
7. Independent security pen test + accessibility audit (WCAG 2.1 AA) + clinical validation for any SaMD features.
