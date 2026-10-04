import { expect, test } from "vitest";
import {
  parseNonNegativeInt,
  percentOfYearLeft,
  personTimeResult,
  weekendsLeft,
} from "./time.ts";

test("1 January 2026 leaves the whole year and 52 weekends", () => {
  const today = new Date(2026, 0, 1);
  expect(percentOfYearLeft(today)).toBe(100);
  expect(weekendsLeft(today)).toBe(52);
});

test("4 January 2026 leaves 51 weekends", () => {
  expect(weekendsLeft(new Date(2026, 0, 4))).toBe(51);
});

test("31 December 2026 leaves no year percent and no weekends", () => {
  const today = new Date(2026, 11, 31);
  expect(percentOfYearLeft(today)).toBe(0);
  expect(weekendsLeft(today)).toBe(0);
});

test("weekly visits from age 30", () => {
  expect(
    personTimeResult({ name: "Grandma", age: 30, count: 1, unit: "week" }),
  ).toEqual({ kind: "visits", visits: 2860 });
});

test("age 85 has no visits left", () => {
  expect(
    personTimeResult({ name: "Grandma", age: 85, count: 1, unit: "week" }),
  ).toEqual({ kind: "visits", visits: 0 });
});

test("age 86 returns the longevity message", () => {
  expect(
    personTimeResult({ name: "Ada", age: 86, count: 1, unit: "week" }),
  ).toEqual({
    kind: "message",
    message: "Ada is living longer than average, every visit counts!",
  });
});

test("monthly visits from age 30", () => {
  expect(
    personTimeResult({ name: "Grandma", age: 30, count: 2, unit: "month" }),
  ).toEqual({ kind: "visits", visits: 1320 });
});

test("yearly visits from age 30", () => {
  expect(
    personTimeResult({ name: "Grandma", age: 30, count: 1, unit: "year" }),
  ).toEqual({ kind: "visits", visits: 55 });
});

test("parseNonNegativeInt accepts digits and rejects empty, decimal, and signed strings", () => {
  expect(parseNonNegativeInt("30")).toBe(30);
  expect(parseNonNegativeInt("")).toBeNull();
  expect(parseNonNegativeInt("30.5")).toBeNull();
  expect(parseNonNegativeInt("-1")).toBeNull();
});
