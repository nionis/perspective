import { expect, test } from "vitest";
import {
  DEFAULT_HORIZON,
  LEAD_YEARS,
  summersSpan,
  visitsSpan,
  visitsStartAge,
} from "./life.ts";

test("the visits span starts five years before today's age", () => {
  expect(visitsSpan(75, 2, DEFAULT_HORIZON)).toEqual({ spent: 120, left: 240 });
  expect(visitsSpan(40, 2, DEFAULT_HORIZON)).toEqual({
    spent: 120,
    left: 1_080,
  });
  expect(visitsSpan(31, 1, DEFAULT_HORIZON)).toEqual({ spent: 60, left: 648 });
});

test("visits follow the horizon the reader sets", () => {
  expect(visitsSpan(70, 2, 90)).toEqual({ spent: 120, left: 480 });
  expect(visitsSpan(70, 2, 60)).toEqual({ spent: 120, left: 0 });
  expect(visitsSpan(70, 2, 1)).toEqual({ spent: 120, left: 0 });
});

test("a young age never starts before zero", () => {
  expect(visitsStartAge(3)).toBe(0);
  expect(visitsSpan(3, 2, DEFAULT_HORIZON)).toEqual({
    spent: 72,
    left: 1_968,
  });
  expect(visitsSpan(0, 2, DEFAULT_HORIZON)).toEqual({ spent: 0, left: 2_040 });
  expect(visitsStartAge(75)).toBe(70);
});

test("a full lead is five years of visits", () => {
  expect(visitsSpan(90, 2, DEFAULT_HORIZON).spent).toBe(LEAD_YEARS * 12 * 2);
});

test("no visits past the horizon", () => {
  expect(visitsSpan(DEFAULT_HORIZON, 2, DEFAULT_HORIZON).left).toBe(0);
  expect(visitsSpan(90, 2, DEFAULT_HORIZON).left).toBe(0);
  expect(visitsSpan(75, 0, DEFAULT_HORIZON)).toEqual({ spent: 0, left: 0 });
});

test("summers run from birth to the horizon", () => {
  expect(summersSpan(0, DEFAULT_HORIZON)).toEqual({
    spent: 0,
    left: DEFAULT_HORIZON,
  });
  expect(summersSpan(6, DEFAULT_HORIZON)).toEqual({ spent: 6, left: 79 });
  expect(summersSpan(84, DEFAULT_HORIZON)).toEqual({ spent: 84, left: 1 });
});

test("summers follow the horizon the reader sets", () => {
  expect(summersSpan(6, 100)).toEqual({ spent: 6, left: 94 });
  expect(summersSpan(40, 30)).toEqual({ spent: 30, left: 0 });
  expect(summersSpan(90, 100)).toEqual({ spent: 90, left: 10 });
});

test("no summers past the horizon", () => {
  expect(summersSpan(DEFAULT_HORIZON, DEFAULT_HORIZON)).toEqual({
    spent: DEFAULT_HORIZON,
    left: 0,
  });
  expect(summersSpan(90, DEFAULT_HORIZON)).toEqual({
    spent: DEFAULT_HORIZON,
    left: 0,
  });
});
