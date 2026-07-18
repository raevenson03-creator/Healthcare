import { Permission, ROLE_PERMISSIONS, UserRole } from '@/types/roles';

/** Returns true if the role is granted the permission. */
export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns true if the role has ALL of the listed permissions. */
export function canAll(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p));
}

/** Returns true if the role has ANY of the listed permissions. */
export function canAny(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

/**
 * Enforce "minimum necessary" for cross-patient access: a patient may only
 * ever access their own record; clinicians may access assigned patients.
 * (The assignment list is authoritative on the server; this is client-side
 * defense-in-depth.)
 */
export function canAccessPatientRecord(
  role: UserRole,
  viewerFhirRef: string,
  targetPatientId: string,
  assignedPatientIds: string[] = [],
): boolean {
  if (role === 'patient') return viewerFhirRef === targetPatientId;
  if (can(role, 'records:read:assigned')) return assignedPatientIds.includes(targetPatientId);
  return false;
}
