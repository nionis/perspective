import { expect, test } from "vitest";
import {
  parseCardDate,
  parseShareSearch,
  shareImagePath,
  sharePath,
  shareSearch,
  shareUrl,
} from "./share.ts";

test("no chart means no share", () => {
  expect(parseShareSearch("")).toBeNull();
  expect(parseShareSearch("?chart=about")).toBeNull();
  expect(parseShareSearch(new URLSearchParams("chart=Days"))).toBeNull();
});

test("days and weekends ignore every extra parameter", () => {
  expect(parseShareSearch("?chart=days")).toEqual({ chart: "days" });
  expect(parseShareSearch("?chart=days&age=6&horizon=85")).toEqual({
    chart: "days",
  });
  expect(parseShareSearch("?chart=weekends&d=2026-11-23")).toEqual({
    chart: "weekends",
  });
});

test("summers fill in the plate defaults", () => {
  expect(parseShareSearch("?chart=summers")).toEqual({
    chart: "summers",
    age: 0,
    horizon: 85,
  });
  expect(parseShareSearch("?chart=summers&age=6&horizon=85")).toEqual({
    chart: "summers",
    age: 6,
    horizon: 85,
  });
  expect(parseShareSearch("?chart=summers&age=6")).toEqual({
    chart: "summers",
    age: 6,
    horizon: 85,
  });
});

test("visits fill in the plate defaults", () => {
  expect(parseShareSearch("?chart=visits")).toEqual({
    chart: "visits",
    age: 75,
    rate: 2,
    horizon: 85,
  });
  expect(parseShareSearch("?chart=visits&age=70&rate=3&horizon=90")).toEqual({
    chart: "visits",
    age: 70,
    rate: 3,
    horizon: 90,
  });
});

test("a present field outside the range invalidates the share", () => {
  for (const search of [
    "?chart=summers&age=121",
    "?chart=summers&age=-1",
    "?chart=summers&horizon=121",
    "?chart=summers&age=6.5",
    "?chart=summers&age=",
    "?chart=summers&age=abc",
    "?chart=visits&rate=32",
    "?chart=visits&rate=-1",
    "?chart=visits&age=",
    "?chart=visits&horizon=1000",
  ]) {
    expect(parseShareSearch(search)).toBeNull();
  }
});

test("range ends are accepted", () => {
  expect(parseShareSearch("?chart=summers&age=0&horizon=120")).toEqual({
    chart: "summers",
    age: 0,
    horizon: 120,
  });
  expect(parseShareSearch("?chart=visits&age=120&rate=31&horizon=120")).toEqual({
    chart: "visits",
    age: 120,
    rate: 31,
    horizon: 120,
  });
});

test("serialization round-trips through the parser", () => {
  const shares = [
    { chart: "days" },
    { chart: "weekends" },
    { chart: "summers", age: 6, horizon: 85 },
    { chart: "visits", age: 75, rate: 2, horizon: 85 },
  ] as const;
  for (const params of shares) {
    const search = shareSearch(params).toString();
    expect(parseShareSearch(search)).toEqual(params);
    expect(sharePath(params)).toBe(`/?${search}`);
  }
});

test("share paths carry only the fields the chart needs", () => {
  expect(sharePath({ chart: "days" })).toBe("/?chart=days");
  expect(sharePath({ chart: "summers", age: 6, horizon: 85 })).toBe(
    "/?chart=summers&age=6&horizon=85",
  );
  expect(sharePath({ chart: "visits", age: 75, rate: 2, horizon: 85 })).toBe(
    "/?chart=visits&age=75&rate=2&horizon=85",
  );
  expect(shareUrl("https://example.com", { chart: "days" })).toBe(
    "https://example.com/?chart=days",
  );
});

test("the image path stamps the day only for the calendar charts", () => {
  const date = new Date(2026, 10, 23);
  expect(shareImagePath({ chart: "days" }, date)).toBe(
    "/api/og?chart=days&d=2026-11-23",
  );
  expect(shareImagePath({ chart: "weekends" }, date)).toBe(
    "/api/og?chart=weekends&d=2026-11-23",
  );
  expect(shareImagePath({ chart: "days" })).toBe("/api/og?chart=days");
  expect(
    shareImagePath({ chart: "summers", age: 6, horizon: 85 }, date),
  ).toBe("/api/og?chart=summers&age=6&horizon=85");
});

test("the card date is read only when it is a real calendar day", () => {
  expect(parseCardDate(new URLSearchParams(""))).toBeNull();
  expect(parseCardDate(new URLSearchParams("d=2026-11-23"))?.getFullYear()).toBe(
    2026,
  );
  expect(parseCardDate(new URLSearchParams("d=2026-02-30"))).toBeNull();
  expect(parseCardDate(new URLSearchParams("d=2026-13-01"))).toBeNull();
  expect(parseCardDate(new URLSearchParams("d=2026-1-1"))).toBeNull();
  expect(parseCardDate(new URLSearchParams("d=nope"))).toBeNull();
});
