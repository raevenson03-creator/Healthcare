import {
  checkAllergyConflicts,
  checkDrugInteractions,
  checkDuplicateTherapy,
  runAllChecks,
} from '@/services/clinicalDecisionSupport';
import { Allergy, Medication } from '@/types/models';

const med = (name: string): Medication => ({
  id: `m-${name}`,
  patientId: 'patient-1',
  name,
  dose: '10 mg',
  frequency: 'daily',
  route: 'oral',
  status: 'active',
  prescriberName: 'Dr. Demo',
  scheduleTimes: ['08:00'],
  refillsRemaining: 1,
});

const allergy = (substance: string, severity: Allergy['severity']): Allergy => ({
  id: `a-${substance}`,
  patientId: 'patient-1',
  substance,
  reaction: 'reaction',
  severity,
  category: 'medication',
});

describe('clinical decision support (spec 4.3 / 8.1)', () => {
  it('flags a known drug-drug interaction regardless of order', () => {
    const current = [med('Warfarin')];
    expect(checkDrugInteractions('aspirin', current)).toHaveLength(1);
    expect(checkDrugInteractions('Aspirin', current)[0]?.severity).toBe('major');
  });

  it('flags allergy cross-reactivity (penicillin -> amoxicillin)', () => {
    const alerts = checkAllergyConflicts('amoxicillin', [allergy('Penicillin', 'anaphylaxis')]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.severity).toBe('contraindicated');
  });

  it('flags duplicate therapy', () => {
    const alerts = checkDuplicateTherapy('metformin', [med('Metformin')]);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.type).toBe('duplicate');
  });

  it('returns no alerts for a safe medication', () => {
    expect(runAllChecks('vitamin d', [med('Metformin')], [])).toHaveLength(0);
  });

  it('sorts alerts by severity, most severe first', () => {
    const current = [med('Warfarin'), med('amoxicillin')];
    const allergies = [allergy('Penicillin', 'anaphylaxis')];
    const alerts = runAllChecks('amoxicillin', current, allergies);
    expect(alerts[0]?.severity).toBe('contraindicated');
  });
});
