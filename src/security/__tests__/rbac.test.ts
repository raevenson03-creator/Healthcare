import { can, canAll, canAny, canAccessPatientRecord } from '@/security/rbac';

describe('rbac', () => {
  it('grants a patient access only to their own record', () => {
    expect(can('patient', 'records:read:own')).toBe(true);
    expect(can('patient', 'medications:prescribe')).toBe(false);
  });

  it('allows physicians to prescribe and break-glass', () => {
    expect(can('physician', 'medications:prescribe')).toBe(true);
    expect(can('physician', 'breakglass:invoke')).toBe(true);
  });

  it('canAll / canAny combine permissions', () => {
    expect(canAll('physician', ['records:write', 'medications:prescribe'])).toBe(true);
    expect(canAll('nurse', ['records:write', 'medications:prescribe'])).toBe(false);
    expect(canAny('nurse', ['records:write', 'vitals:write'])).toBe(true);
  });

  it('enforces minimum-necessary patient record access', () => {
    // Patient can only see their own linked record.
    expect(canAccessPatientRecord('patient', 'patient-1', 'patient-1')).toBe(true);
    expect(canAccessPatientRecord('patient', 'patient-1', 'patient-2')).toBe(false);

    // Clinician can only see assigned patients.
    expect(
      canAccessPatientRecord('physician', 'practitioner-1', 'patient-1', ['patient-1']),
    ).toBe(true);
    expect(
      canAccessPatientRecord('physician', 'practitioner-1', 'patient-9', ['patient-1']),
    ).toBe(false);
  });
});
