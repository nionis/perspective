import {
  AGE_MAX,
  DEFAULT_HORIZON,
  DEFAULT_SUMMERS_AGE,
  DEFAULT_VISITS_AGE,
  DEFAULT_VISITS_RATE,
  VISITS_PER_MONTH_MAX,
} from "../life.ts";
import { isoDate } from "../time.ts";

export const SHARE_CHARTS = ["days", "weekends", "summers", "visits"] as const;

export type ShareChart = (typeof SHARE_CHARTS)[number];

export type ShareParams =
  | { chart: "days" }
  | { chart: "weekends" }
  | { chart: "summers"; age: number; horizon: number }
  | { chart: "visits"; age: number; rate: number; horizon: number };

function readInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number | null {
  if (value === null) return fallback;
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

export function parseShareSearch(
  search: URLSearchParams | string,
): ShareParams | null {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const chart = params.get("chart");
  if (chart === "days" || chart === "weekends") return { chart };
  if (chart === "summers") {
    const age = readInt(params.get("age"), DEFAULT_SUMMERS_AGE, 0, AGE_MAX);
    const horizon = readInt(params.get("horizon"), DEFAULT_HORIZON, 0, AGE_MAX);
    return age === null || horizon === null
      ? null
      : { chart, age, horizon };
  }
  if (chart === "visits") {
    const age = readInt(params.get("age"), DEFAULT_VISITS_AGE, 0, AGE_MAX);
    const rate = readInt(
      params.get("rate"),
      DEFAULT_VISITS_RATE,
      0,
      VISITS_PER_MONTH_MAX,
    );
    const horizon = readInt(params.get("horizon"), DEFAULT_HORIZON, 0, AGE_MAX);
    return age === null || rate === null || horizon === null
      ? null
      : { chart, age, rate, horizon };
  }
  return null;
}

export function shareSearch(params: ShareParams): URLSearchParams {
  const search = new URLSearchParams();
  search.set("chart", params.chart);
  if (params.chart === "summers") {
    search.set("age", String(params.age));
    search.set("horizon", String(params.horizon));
  }
  if (params.chart === "visits") {
    search.set("age", String(params.age));
    search.set("rate", String(params.rate));
    search.set("horizon", String(params.horizon));
  }
  return search;
}

export function sharePath(params: ShareParams): string {
  return `/?${shareSearch(params).toString()}`;
}

export function shareUrl(origin: string, params: ShareParams): string {
  return new URL(sharePath(params), origin).toString();
}

export function shareImagePath(params: ShareParams, date?: Date): string {
  const search = shareSearch(params);
  if ((params.chart === "days" || params.chart === "weekends") && date) {
    search.set("d", isoDate(date));
  }
  return `/api/og?${search.toString()}`;
}

export function parseCardDate(search: URLSearchParams): Date | null {
  const value = search.get("d");
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}
