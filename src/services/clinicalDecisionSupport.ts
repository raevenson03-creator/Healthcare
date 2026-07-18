import { Allergy, Medication } from '@/types/models';

/**
 * Clinical Decision Support (spec 4.3, 8.1).
 *
 * A minimal, dependency-free rules engine that flags drug–drug interactions,
 * drug–allergy conflicts, and duplicate therapy at prescribe time. In
 * production this is backed by a licensed database (e.g. First Databank,
 * Medi-Span) surfaced through a service; the interfaces here match so the UI
 * does not change when swapped.
 */

export type AlertSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor';

export interface CdsAlert {
  type: 'interaction' | 'allergy' | 'duplicate';
  severity: AlertSeverity;
  message: string;
}

/** Illustrative interaction pairs (lowercased drug names). */
const INTERACTION_PAIRS: Array<{ a: string; b: string; severity: AlertSeverity; note: string }> = [
  { a: 'warfarin', b: 'aspirin', severity: 'major', note: 'Increased bleeding risk' },
  { a: 'lisinopril', b: 'potassium', severity: 'moderate', note: 'Risk of hyperkalemia' },
  { a: 'simvastatin', b: 'clarithromycin', severity: 'contraindicated', note: 'Rhabdomyolysis risk' },
  { a: 'metformin', b: 'contrast dye', severity: 'major', note: 'Risk of lactic acidosis' },
];

/** Cross-reactivity map for allergy checks (allergen -> related drugs). */
const ALLERGY_CROSS_REACTIVITY: Record<string, string[]> = {
  penicillin: ['amoxicillin', 'ampicillin', 'penicillin'],
  sulfa: ['sulfamethoxazole', 'sulfasalazine'],
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function checkDrugInteractions(
  candidate: string,
  current: Medication[],
): CdsAlert[] {
  const c = norm(candidate);
  const alerts: CdsAlert[] = [];
  for (const med of current) {
    const existing = norm(med.name);
    for (const pair of INTERACTION_PAIRS) {
      const isMatch =
        (pair.a === c && pair.b === existing) || (pair.b === c && pair.a === existing);
      if (isMatch) {
        alerts.push({
          type: 'interaction',
          severity: pair.severity,
          message: `${candidate} + ${med.name}: ${pair.note}`,
        });
      }
    }
  }
  return alerts;
}

export function checkAllergyConflicts(candidate: string, allergies: Allergy[]): CdsAlert[] {
  const c = norm(candidate);
  const alerts: CdsAlert[] = [];
  for (const allergy of allergies) {
    const related = ALLERGY_CROSS_REACTIVITY[norm(allergy.substance)] ?? [norm(allergy.substance)];
    if (related.includes(c)) {
      alerts.push({
        type: 'allergy',
        severity: allergy.severity === 'anaphylaxis' ? 'contraindicated' : 'major',
        message: `${candidate} conflicts with documented allergy to ${allergy.substance} (${allergy.reaction}).`,
      });
    }
  }
  return alerts;
}

export function checkDuplicateTherapy(candidate: string, current: Medication[]): CdsAlert[] {
  const c = norm(candidate);
  return current
    .filter((m) => norm(m.name) === c)
    .map((m) => ({
      type: 'duplicate' as const,
      severity: 'moderate' as const,
      message: `Duplicate therapy: ${m.name} is already active (${m.dose}, ${m.frequency}).`,
    }));
}

/** Run all checks and return alerts ordered by severity (most severe first). */
export function runAllChecks(
  candidate: string,
  current: Medication[],
  allergies: Allergy[],
): CdsAlert[] {
  const order: Record<AlertSeverity, number> = {
    contraindicated: 0,
    major: 1,
    moderate: 2,
    minor: 3,
  };
  return [
    ...checkAllergyConflicts(candidate, allergies),
    ...checkDrugInteractions(candidate, current),
    ...checkDuplicateTherapy(candidate, current),
  ].sort((a, b) => order[a.severity] - order[b.severity]);
}
