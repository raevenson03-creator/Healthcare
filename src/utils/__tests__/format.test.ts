import { appointmentStatusTone, appointmentTypeLabel, calculateAge, relativeTime } from '@/utils/format';

describe('format utils', () => {
  it('maps appointment statuses to badge tones', () => {
    expect(appointmentStatusTone('confirmed')).toBe('success');
    expect(appointmentStatusTone('cancelled')).toBe('danger');
    expect(appointmentStatusTone('booked')).toBe('warning');
    expect(appointmentStatusTone('completed')).toBe('info');
  });

  it('labels appointment types', () => {
    expect(appointmentTypeLabel('video')).toBe('Video visit');
    expect(appointmentTypeLabel('in-person')).toBe('In-person');
  });

  it('calculates age from a birth date', () => {
    const year = new Date().getFullYear();
    expect(calculateAge(`${year - 30}-01-01`)).toBeGreaterThanOrEqual(29);
    expect(calculateAge(`${year - 30}-01-01`)).toBeLessThanOrEqual(30);
  });

  it('produces relative time phrases', () => {
    const future = new Date(Date.now() + 2 * 3600000).toISOString();
    const past = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(relativeTime(future)).toContain('in ');
    expect(relativeTime(past)).toContain('ago');
  });
});
