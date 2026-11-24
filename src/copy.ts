import {
  summersSpan,
  visitsSpan,
  visitsStartAge,
} from "./life.ts";
import type { ShareParams } from "./share/share.ts";
import type { WeekendLayout, YearLayout } from "./time.ts";
import { weekendLayout, yearLayout } from "./time.ts";

export const DAYS_TITLE = "The year, in days";
export const WEEKENDS_TITLE = "The year, in weekends";
export const SUMMERS_TITLE = "Your summers left";
export const VISITS_TITLE = "Grandparents visits left";
export const SUMMERS_CAPTION_PREFIX = "One block a summer · until age ";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const WEEKDAYS = [
  { label: "Mon", row: 2 },
  { label: "Wed", row: 4 },
  { label: "Fri", row: 6 },
] as const;

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function summerCount(count: number): string {
  return `${count} summer${count === 1 ? "" : "s"}`;
}

function visitCount(count: number): string {
  return `${formatCount(count)} visit${count === 1 ? "" : "s"}`;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function longDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type ShareCardCopy = {
  title: string;
  meta: string;
  label: string;
  imageCaption: string;
  shareLine: string;
  shareTitle: string;
  empty?: string;
};

export function daysCopy(layout: YearLayout) {
  const spent = layout.days.indexOf("today");
  const left = layout.days.length - spent;
  const today = longDate(new Date(layout.year, 0, spent + 1));
  return {
    title: DAYS_TITLE,
    meta: `${layout.days.length} days`,
    label: `${layout.year}: ${spent} days spent, ${left} days left. Today is ${today}.`,
    imageCaption: "Bone is left · gray is spent · outline is today",
    shareLine: `${layout.year} · ${spent} spent · ${left} left · today ${today}`,
    shareTitle: `Perspective — ${layout.year} in days`,
  };
}

export function weekendsCopy(year: number, weekends: WeekendLayout) {
  const total = weekends.weekends.length;
  const spent = total - weekends.left;
  const nextDate =
    weekends.next === null
      ? null
      : shortDate(new Date(year, 0, weekends.startDay + weekends.next * 7));
  return {
    title: WEEKENDS_TITLE,
    meta: `${weekends.left} left`,
    label: `${total} weekends: ${spent} spent, ${weekends.left} left.${
      nextDate ? ` Next weekend is ${nextDate}.` : ""
    }`,
    imageCaption: `One block a weekend${nextDate ? ` · next is ${nextDate}` : ""}`,
    shareLine: `${total} weekends · ${spent} spent · ${weekends.left} left${
      nextDate ? ` · next ${nextDate}` : ""
    }`,
    shareTitle: `Perspective — ${weekends.left} ${
      weekends.left === 1 ? "weekend" : "weekends"
    } left`,
  };
}

export function summersCopy(age: number, horizon: number) {
  const span = summersSpan(age, horizon);
  const total = span.spent + span.left;
  return {
    title: SUMMERS_TITLE,
    meta: summerCount(span.left),
    label: `${horizon} summers from age 0 to ${horizon}: ${span.spent} spent, ${span.left} left.`,
    caption: `One block a summer · until age ${horizon}`,
    imageCaption: `One block a summer · until age ${horizon}`,
    shareLine: `Age ${age} · until ${horizon} · ${span.spent} spent · ${span.left} left`,
    shareTitle: `Perspective — ${summerCount(span.left)}`,
    empty: `No summers left by age ${horizon}.`,
    spent: span.spent,
    left: span.left,
    total,
  };
}

export function visitsCopy(age: number, rate: number, horizon: number) {
  const span = visitsSpan(age, rate, horizon);
  const start = visitsStartAge(age);
  const total = span.spent + span.left;
  const rateLabel = visitCount(rate);
  return {
    title: VISITS_TITLE,
    meta: visitCount(span.left),
    label: `${visitCount(total)} from age ${start} to ${horizon}: ${visitCount(
      span.spent,
    )} spent, ${visitCount(span.left)} left, at ${rateLabel} a month.`,
    captionPrefix: `${rateLabel} a month · age ${start} to `,
    caption: `${rateLabel} a month · age ${start} to ${horizon}`,
    imageCaption: `${rateLabel} a month · age ${start} to ${horizon}`,
    shareLine: `Age ${age} · ${formatCount(rate)} a month · ${start} to ${horizon} · ${formatCount(
      span.spent,
    )} spent · ${formatCount(span.left)} left`,
    shareTitle: `Perspective — ${visitCount(span.left)}`,
    empty: `No visits left by age ${horizon}.`,
    spent: span.spent,
    left: span.left,
    total,
  };
}

export function shareCopy(params: ShareParams, date: Date): ShareCardCopy {
  switch (params.chart) {
    case "days":
      return daysCopy(yearLayout(date));
    case "weekends": {
      const layout = yearLayout(date);
      return weekendsCopy(layout.year, weekendLayout(layout));
    }
    case "summers":
      return summersCopy(params.age, params.horizon);
    case "visits":
      return visitsCopy(params.age, params.rate, params.horizon);
  }
}
