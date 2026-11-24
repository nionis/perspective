import { expect, test } from "vitest";
import {
  SUMMERS_CAPTION_PREFIX,
  daysCopy,
  shareCopy,
  summersCopy,
  visitsCopy,
  weekendsCopy,
} from "./copy.ts";
import { weekendLayout, yearLayout } from "./time.ts";

const NOVEMBER_23 = new Date(2026, 10, 23);

function weekendsOf(date: Date) {
  const layout = yearLayout(date);
  return weekendsCopy(layout.year, weekendLayout(layout));
}

test("days copy reports spent, today, and left for a fixed date", () => {
  const copy = daysCopy(yearLayout(NOVEMBER_23));
  expect(copy.title).toBe("The year, in days");
  expect(copy.meta).toBe("365 days");
  expect(copy.label).toBe(
    "2026: 326 days spent, 39 days left. Today is Nov 23, 2026.",
  );
  expect(copy.shareLine).toBe("2026 · 326 spent · 39 left · today Nov 23, 2026");
  expect(copy.shareTitle).toBe("Perspective — 2026 in days");
});

test("days copy on the first and last day of the year", () => {
  expect(daysCopy(yearLayout(new Date(2026, 0, 1))).label).toBe(
    "2026: 0 days spent, 365 days left. Today is Jan 1, 2026.",
  );
  expect(daysCopy(yearLayout(new Date(2026, 11, 31))).label).toBe(
    "2026: 364 days spent, 1 days left. Today is Dec 31, 2026.",
  );
});

test("weekends copy matches the fixed date", () => {
  const copy = weekendsOf(NOVEMBER_23);
  expect(copy.meta).toBe("5 left");
  expect(copy.label).toBe(
    "52 weekends: 47 spent, 5 left. Next weekend is Nov 28.",
  );
  expect(copy.imageCaption).toBe("One block a weekend · next is Nov 28");
  expect(copy.shareLine).toBe(
    "52 weekends · 47 spent · 5 left · next Nov 28",
  );
  expect(copy.shareTitle).toBe("Perspective — 5 weekends left");
});

test("weekends copy drops the next line once the year is over", () => {
  const copy = weekendsOf(new Date(2026, 11, 31));
  expect(copy.label).toBe("52 weekends: 52 spent, 0 left.");
  expect(copy.imageCaption).toBe("One block a weekend");
  expect(copy.shareTitle).toBe("Perspective — 0 weekends left");
});

test("weekends copy uses the singular for one weekend left", () => {
  const copy = weekendsOf(new Date(2026, 11, 25));
  expect(copy.meta).toBe("1 left");
  expect(copy.shareTitle).toBe("Perspective — 1 weekend left");
});

test("summers copy at age six", () => {
  const copy = summersCopy(6, 85);
  expect(copy.meta).toBe("79 summers");
  expect(copy.label).toBe(
    "85 summers from age 0 to 85: 6 spent, 79 left.",
  );
  expect(copy.caption).toBe("One block a summer · until age 85");
  expect(copy.shareLine).toBe("Age 6 · until 85 · 6 spent · 79 left");
  expect(copy.shareTitle).toBe("Perspective — 79 summers");
  expect(copy.total).toBe(85);
  expect(copy.left).toBe(79);
});

test("summers copy singular and empty states", () => {
  const one = summersCopy(84, 85);
  expect(one.meta).toBe("1 summer");
  expect(one.shareTitle).toBe("Perspective — 1 summer");

  const none = summersCopy(85, 85);
  expect(none.meta).toBe("0 summers");
  expect(none.empty).toBe("No summers left by age 85.");
  expect(none.left).toBe(0);
});

test("visits copy at the plate defaults", () => {
  const copy = visitsCopy(75, 2, 85);
  expect(copy.meta).toBe("240 visits");
  expect(copy.label).toBe(
    "360 visits from age 70 to 85: 120 visits spent, 240 visits left, at 2 visits a month.",
  );
  expect(copy.captionPrefix).toBe("2 visits a month · age 70 to ");
  expect(copy.imageCaption).toBe("2 visits a month · age 70 to 85");
  expect(copy.shareLine).toBe(
    "Age 75 · 2 a month · 70 to 85 · 120 spent · 240 left",
  );
  expect(copy.shareTitle).toBe("Perspective — 240 visits");
});

test("visits copy counts in groups and singulars", () => {
  const copy = visitsCopy(3, 1, 85);
  expect(copy.meta).toBe("984 visits");
  expect(copy.label).toBe(
    "1,020 visits from age 0 to 85: 36 visits spent, 984 visits left, at 1 visit a month.",
  );
  expect(copy.captionPrefix).toBe("1 visit a month · age 0 to ");
});

test("visits copy empty state past the horizon", () => {
  const copy = visitsCopy(85, 2, 85);
  expect(copy.meta).toBe("0 visits");
  expect(copy.empty).toBe("No visits left by age 85.");
});

test("share copy dispatches on the chart", () => {
  expect(shareCopy({ chart: "days" }, NOVEMBER_23).meta).toBe("365 days");
  expect(shareCopy({ chart: "weekends" }, NOVEMBER_23).meta).toBe("5 left");
  expect(
    shareCopy({ chart: "summers", age: 6, horizon: 85 }, NOVEMBER_23).meta,
  ).toBe("79 summers");
  expect(
    shareCopy(
      { chart: "visits", age: 75, rate: 2, horizon: 85 },
      NOVEMBER_23,
    ).meta,
  ).toBe("240 visits");
  expect(SUMMERS_CAPTION_PREFIX).toBe("One block a summer · until age ");
});
