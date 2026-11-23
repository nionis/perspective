import { expect, test } from "vitest";
import {
  dayOfYear,
  daysInYear,
  weekendLayout,
  yearLayout,
} from "./time.ts";

test("day of year counts from 1 January", () => {
  expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
  expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
  expect(dayOfYear(new Date(2024, 11, 31))).toBe(366);
});

test("days in a common year and a leap year", () => {
  expect(daysInYear(2026)).toBe(365);
  expect(daysInYear(2024)).toBe(366);
});

test("year layout of 1 January 2026", () => {
  const layout = yearLayout(new Date(2026, 0, 1));
  expect(layout.startWeekday).toBe(4);
  expect(layout.columns).toBe(53);
  expect(layout.days).toHaveLength(365);
  expect(layout.days[0]).toBe("today");
  expect(layout.days.filter((day) => day !== "spent")).toHaveLength(365);
});

test("year layout of 23 November 2026", () => {
  const layout = yearLayout(new Date(2026, 10, 23));
  expect(layout.days.filter((day) => day === "spent")).toHaveLength(326);
  expect(layout.days[326]).toBe("today");
  expect(layout.days.filter((day) => day !== "spent")).toHaveLength(39);
});

test("year layout of 31 December 2026", () => {
  const layout = yearLayout(new Date(2026, 11, 31));
  expect(layout.days.filter((day) => day === "spent")).toHaveLength(364);
  expect(layout.days[364]).toBe("today");
  expect(layout.days.filter((day) => day !== "spent")).toHaveLength(1);
});

test("a leap year starting on Saturday needs 54 columns", () => {
  expect(yearLayout(new Date(2028, 0, 1)).columns).toBe(54);
});

test("weekends in 2026", () => {
  const layout = yearLayout(new Date(2026, 10, 23));
  const weekends = weekendLayout(layout);
  expect(weekends.weekends).toHaveLength(52);
  expect(weekends.left).toBe(5);
});

test("weekends at both ends of 2026", () => {
  expect(weekendLayout(yearLayout(new Date(2026, 0, 1))).left).toBe(52);
  expect(weekendLayout(yearLayout(new Date(2026, 11, 31))).left).toBe(0);
});

test("a leap year that starts on Saturday has 53 weekends", () => {
  const weekends = weekendLayout(yearLayout(new Date(2028, 0, 1)));
  expect(weekends.weekends).toHaveLength(53);
  expect(weekends.left).toBe(53);
});

test("a year that starts on Sunday ignores the lone first Sunday", () => {
  const weekends = weekendLayout(yearLayout(new Date(2023, 0, 1)));
  expect(weekends.weekends).toHaveLength(52);
  expect(weekends.startDay).toBe(7);
});

test("the next weekend is the first one still ahead", () => {
  const start = weekendLayout(yearLayout(new Date(2026, 0, 1)));
  expect(start.next).toBe(0);
  expect(start.startDay).toBe(3);

  const november = weekendLayout(yearLayout(new Date(2026, 10, 23)));
  expect(november.next).toBe(47);
  expect(november.startDay + november.next! * 7).toBe(332);

  const done = weekendLayout(yearLayout(new Date(2026, 11, 31)));
  expect(done.left).toBe(0);
  expect(done.next).toBeNull();
});

test("a weekend in progress is not the next weekend", () => {
  expect(weekendLayout(yearLayout(new Date(2026, 10, 28))).next).toBe(48);
  expect(weekendLayout(yearLayout(new Date(2026, 10, 29))).next).toBe(48);
  expect(weekendLayout(yearLayout(new Date(2026, 11, 26))).next).toBeNull();
});

test("a Saturday start begins on 1 January", () => {
  const weekends = weekendLayout(yearLayout(new Date(2028, 0, 1)));
  expect(weekends.startDay).toBe(1);
  expect(weekends.next).toBe(1);
});
