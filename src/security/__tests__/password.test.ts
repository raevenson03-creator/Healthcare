import { evaluatePassword } from '@/security/password';

describe('password policy (spec 2.2)', () => {
  it('rejects a password shorter than 12 chars', () => {
    const result = evaluatePassword('Ab1!ab1!');
    expect(result.valid).toBe(false);
    expect(result.failed.map((r) => r.id)).toContain('length');
  });

  it('requires all character classes', () => {
    expect(evaluatePassword('alllowercase1!').valid).toBe(false); // no uppercase
    expect(evaluatePassword('ALLUPPERCASE1!').valid).toBe(false); // no lowercase
    expect(evaluatePassword('NoNumbersHere!').valid).toBe(false); // no number
    expect(evaluatePassword('NoSpecials1234').valid).toBe(false); // no special
  });

  it('accepts a compliant password', () => {
    const result = evaluatePassword('CareBridge#2026');
    expect(result.valid).toBe(true);
    expect(result.score).toBe(1);
  });
});
