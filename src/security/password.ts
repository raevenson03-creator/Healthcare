/**
 * Password policy validation (spec 2.2).
 *
 * Note: this validates *strength* only for good UX at input time. Reuse-history
 * (last 10), expiration (90/180 days), and lockout (5 attempts) are enforced
 * server-side because they require durable state the client must not hold.
 */

export interface PasswordRule {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  { id: 'upper', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  {
    id: 'special',
    label: 'One special character',
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export interface PasswordEvaluation {
  valid: boolean;
  failed: PasswordRule[];
  /** 0..1 fraction of satisfied rules, for a strength meter. */
  score: number;
}

export function evaluatePassword(pw: string): PasswordEvaluation {
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(pw));
  return {
    valid: failed.length === 0,
    failed,
    score: (PASSWORD_RULES.length - failed.length) / PASSWORD_RULES.length,
  };
}
