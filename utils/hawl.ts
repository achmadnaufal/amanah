/**
 * Hawl Tracker — Islamic lunar year countdown for Zakat obligation.
 *
 * The hawl is the period of one full lunar (Hijri) year that must pass
 * while assets remain above nisab before Zakat becomes due.
 * A Hijri year is approximately 354.37 days.
 */

const HIJRI_YEAR_DAYS = 354.37;

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah',
];

export interface HawlStatus {
  isTracking: boolean;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercent: number;
  isComplete: boolean;
  estimatedDueDate: Date | null;
  hijriStartDate: string | null;
}

/**
 * Convert a Gregorian date to a Hijri date string.
 */
export function toHijriDate(date: Date): string {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719)
    + Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * lll) / 709);
  const day = lll - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year} AH`;
}

/**
 * Calculate hawl status based on the start date (when assets first exceeded nisab).
 */
export function calculateHawlStatus(hawlStartDate: string | null): HawlStatus {
  if (!hawlStartDate) {
    return {
      isTracking: false,
      daysElapsed: 0,
      daysRemaining: 0,
      totalDays: Math.round(HIJRI_YEAR_DAYS),
      progressPercent: 0,
      isComplete: false,
      estimatedDueDate: null,
      hijriStartDate: null,
    };
  }

  const start = new Date(hawlStartDate);
  const now = new Date();
  const msPerDay = 86400000;
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / msPerDay);
  const totalDays = Math.round(HIJRI_YEAR_DAYS);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const isComplete = daysElapsed >= totalDays;
  const progressPercent = Math.min((daysElapsed / totalDays) * 100, 100);

  const estimatedDueDate = new Date(start.getTime() + totalDays * msPerDay);
  const hijriStartDate = toHijriDate(start);

  return {
    isTracking: true,
    daysElapsed,
    daysRemaining,
    totalDays,
    progressPercent,
    isComplete,
    estimatedDueDate,
    hijriStartDate,
  };
}
