import { calculateHawlStatus, toHijriDate } from '../utils/hawl';

describe('calculateHawlStatus', () => {
  it('should return not tracking when no start date', () => {
    const status = calculateHawlStatus(null);
    expect(status.isTracking).toBe(false);
    expect(status.daysElapsed).toBe(0);
    expect(status.daysRemaining).toBe(0);
    expect(status.isComplete).toBe(false);
    expect(status.estimatedDueDate).toBeNull();
  });

  it('should track days elapsed from start date', () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const status = calculateHawlStatus(tenDaysAgo.toISOString());

    expect(status.isTracking).toBe(true);
    expect(status.daysElapsed).toBe(10);
    expect(status.daysRemaining).toBe(354 - 10);
    expect(status.isComplete).toBe(false);
    expect(status.progressPercent).toBeCloseTo((10 / 354) * 100, 0);
  });

  it('should mark as complete after one hijri year', () => {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 355);
    const status = calculateHawlStatus(oneYearAgo.toISOString());

    expect(status.isTracking).toBe(true);
    expect(status.isComplete).toBe(true);
    expect(status.daysRemaining).toBe(0);
    expect(status.progressPercent).toBe(100);
  });

  it('should calculate correct progress at halfway', () => {
    const halfYear = new Date();
    halfYear.setDate(halfYear.getDate() - 177);
    const status = calculateHawlStatus(halfYear.toISOString());

    expect(status.progressPercent).toBeCloseTo(50, 0);
  });

  it('should provide estimated due date', () => {
    const start = new Date();
    start.setDate(start.getDate() - 100);
    const status = calculateHawlStatus(start.toISOString());

    expect(status.estimatedDueDate).not.toBeNull();
    const expectedDue = new Date(start.getTime() + 354 * 86400000);
    const diff = Math.abs(status.estimatedDueDate!.getTime() - expectedDue.getTime());
    expect(diff).toBeLessThan(86400000); // Within 1 day
  });

  it('should provide hijri start date string', () => {
    const start = new Date('2025-01-01');
    const status = calculateHawlStatus(start.toISOString());

    expect(status.hijriStartDate).toBeDefined();
    expect(status.hijriStartDate).toContain('AH');
  });
});

describe('toHijriDate', () => {
  it('should convert a known Gregorian date to Hijri', () => {
    const date = new Date('2024-01-01');
    const hijri = toHijriDate(date);
    expect(hijri).toContain('AH');
    expect(hijri).toMatch(/\d+ .+ \d+ AH/);
  });

  it('should handle different dates', () => {
    const date1 = toHijriDate(new Date('2025-03-01'));
    const date2 = toHijriDate(new Date('2025-06-15'));
    expect(date1).not.toBe(date2);
  });
});
