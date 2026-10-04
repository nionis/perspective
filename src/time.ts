export type VisitUnit = "week" | "month" | "year";

const VISITS_PER_UNIT: Record<VisitUnit, number> = {
  week: 52,
  month: 12,
  year: 1,
};

export const LIFE_EXPECTANCY = 85;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function utcDayNumber(year: number, monthIndex: number, day: number): number {
  return Math.floor(Date.UTC(year, monthIndex, day) / 86_400_000);
}

export function daysLeftInYear(today: Date): number {
  const year = today.getFullYear();
  const dayOfYear =
    utcDayNumber(year, today.getMonth(), today.getDate()) -
    utcDayNumber(year, 0, 1) +
    1;
  return daysInYear(year) - dayOfYear + 1;
}

export function percentOfYearLeft(today: Date): number {
  const year = today.getFullYear();
  return Math.round((daysLeftInYear(today) / daysInYear(year)) * 100);
}

export function weekendsLeft(today: Date): number {
  const year = today.getFullYear();
  const todayUtc = Date.UTC(year, today.getMonth(), today.getDate());
  const yearEndUtc = Date.UTC(year, 11, 31);
  const weekday = new Date(todayUtc).getUTCDay();
  const daysUntilSaturday = (6 - weekday + 7) % 7;
  let saturday = todayUtc + daysUntilSaturday * 86_400_000;
  let count = 0;
  while (saturday <= yearEndUtc) {
    count += 1;
    saturday += 7 * 86_400_000;
  }
  return count;
}

export type PersonTime =
  | { kind: "visits"; visits: number }
  | { kind: "message"; message: string };

export function longevityMessage(name: string): string {
  return `${name} is living longer than average, every visit counts!`;
}

export function personTimeResult(input: {
  name: string;
  age: number;
  count: number;
  unit: VisitUnit;
}): PersonTime {
  if (input.age > LIFE_EXPECTANCY) {
    return { kind: "message", message: longevityMessage(input.name) };
  }
  if (input.age === LIFE_EXPECTANCY) {
    return { kind: "visits", visits: 0 };
  }
  const visits =
    (LIFE_EXPECTANCY - input.age) *
    input.count *
    VISITS_PER_UNIT[input.unit];
  return { kind: "visits", visits };
}

export function parseNonNegativeInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return null;
  return value;
}
