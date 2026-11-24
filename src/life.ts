/** Horizon both estimates open on, in years. Each plate lets the reader edit it. */
export const DEFAULT_HORIZON = 85;

/** Years of visits the chart draws behind the current age. */
export const LEAD_YEARS = 5;

const MONTHS_PER_YEAR = 12;

/**
 * Visits from `LEAD_YEARS` before the current age to the horizon.
 * `spent` is what that rate would have produced in those years, `left` is what is ahead.
 */
export function visitsSpan(
  age: number,
  visitsPerMonth: number,
  horizon: number,
): { spent: number; left: number } {
  return {
    spent: Math.min(age, LEAD_YEARS) * MONTHS_PER_YEAR * visitsPerMonth,
    left: Math.max(0, horizon - age) * MONTHS_PER_YEAR * visitsPerMonth,
  };
}

/** Age the chart starts counting visits at. */
export function visitsStartAge(age: number): number {
  return Math.max(0, age - LEAD_YEARS);
}

/** One summer a year from birth to the horizon: `spent` are the summers lived. */
export function summersSpan(
  age: number,
  horizon: number,
): { spent: number; left: number } {
  return {
    spent: Math.min(age, horizon),
    left: Math.max(0, horizon - age),
  };
}

/** Highest accepted age, in years. */
export const AGE_MAX = 120;

/** Highest accepted monthly visit rate. */
export const VISITS_PER_MONTH_MAX = 31;

/** Age the summers plate opens on. */
export const DEFAULT_SUMMERS_AGE = 0;

/** Age the visits plate opens on. */
export const DEFAULT_VISITS_AGE = 75;

/** Visits a month the visits plate opens on. */
export const DEFAULT_VISITS_RATE = 2;
