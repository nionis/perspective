export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

function utcDayNumber(year: number, monthIndex: number, day: number): number {
  return Math.floor(Date.UTC(year, monthIndex, day) / 86_400_000);
}

export type DayStatus = "spent" | "left" | "today";

export type YearLayout = {
  year: number;
  startWeekday: number;
  columns: number;
  days: DayStatus[];
};

export function dayOfYear(today: Date): number {
  const year = today.getFullYear();
  return (
    utcDayNumber(year, today.getMonth(), today.getDate()) -
    utcDayNumber(year, 0, 1) +
    1
  );
}

export type Weekend = {
  days: [DayStatus, DayStatus];
};

export type WeekendLayout = {
  weekends: Weekend[];
  left: number;
  next: number | null;
  startDay: number;
};

export function weekendLayout(layout: YearLayout): WeekendLayout {
  const { startWeekday, days } = layout;
  const firstSaturday = (6 - startWeekday + 7) % 7;
  const weekends: Weekend[] = [];
  for (let index = firstSaturday; index + 1 < days.length; index += 7) {
    weekends.push({ days: [days[index], days[index + 1]] });
  }
  const isLeft = ({ days: pair }: Weekend) =>
    pair.some((day) => day !== "spent");
  const left = weekends.filter(isLeft).length;
  const next = weekends.findIndex(
    ({ days: pair }) => pair.includes("left") && !pair.includes("today"),
  );
  return {
    weekends,
    left,
    next: next === -1 ? null : next,
    startDay: firstSaturday + 1,
  };
}

export function yearLayout(today: Date): YearLayout {
  const year = today.getFullYear();
  const total = daysInYear(year);
  const startWeekday = new Date(year, 0, 1).getDay();
  const current = dayOfYear(today);
  const days: DayStatus[] = [];
  for (let i = 0; i < total; i += 1) {
    const day = i + 1;
    days.push(day < current ? "spent" : day === current ? "today" : "left");
  }
  return {
    year,
    startWeekday,
    columns: Math.ceil((startWeekday + total) / 7),
    days,
  };
}
