/**
 * User roles and RBAC permission model (spec 2.1, 13.2).
 *
 * Permissions follow the HIPAA "minimum necessary" principle — each role is
 * granted only the capabilities it needs. The mobile client enforces these for
 * UX/defense-in-depth, but the authoritative check MUST also happen server-side.
 */
export type UserRole =
  | 'patient'
  | 'physician'
  | 'specialist'
  | 'nurse'
  | 'pharmacist'
  | 'admin'
  | 'billing';

export type Permission =
  | 'records:read:own'
  | 'records:read:assigned'
  | 'records:write'
  | 'appointments:book'
  | 'appointments:manage'
  | 'medications:prescribe'
  | 'medications:verify'
  | 'messaging:patient'
  | 'billing:read'
  | 'billing:manage'
  | 'admin:manage'
  | 'vitals:write'
  | 'breakglass:invoke';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: ['records:read:own', 'appointments:book', 'messaging:patient', 'billing:read'],
  physician: [
    'records:read:assigned',
    'records:write',
    'appointments:manage',
    'medications:prescribe',
    'messaging:patient',
    'vitals:write',
    'breakglass:invoke',
  ],
  specialist: [
    'records:read:assigned',
    'records:write',
    'appointments:manage',
    'medications:prescribe',
    'messaging:patient',
    'breakglass:invoke',
  ],
  nurse: ['records:read:assigned', 'vitals:write', 'messaging:patient', 'medications:verify'],
  pharmacist: ['medications:verify', 'records:read:assigned'],
  admin: ['admin:manage'],
  billing: ['billing:read', 'billing:manage'],
};

/** Roles that use the provider (clinician) experience shell. */
export const PROVIDER_ROLES: UserRole[] = [
  'physician',
  'specialist',
  'nurse',
  'pharmacist',
];
