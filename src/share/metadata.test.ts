import { expect, test } from "vitest";
import { shareMetadata } from "./metadata.ts";

const NOVEMBER_23 = new Date(2026, 10, 23);

test("a days share carries its own title, description, and image", () => {
  const meta = shareMetadata({ chart: "days" }, NOVEMBER_23);
  expect(meta.title).toBe("Perspective — 2026 in days");
  expect(meta.description).toBe(
    "2026: 326 days spent, 39 days left. Today is Nov 23, 2026.",
  );
  expect(meta.alternates).toEqual({ canonical: "/?chart=days" });
  expect(meta.openGraph).toMatchObject({
    type: "website",
    siteName: "Perspective",
    title: "Perspective — 2026 in days",
    url: "/?chart=days",
  });
  expect(meta.openGraph && "images" in meta.openGraph
    ? meta.openGraph.images
    : null).toEqual([
    {
      url: "/api/og?chart=days&d=2026-11-23",
      width: 1200,
      height: 630,
      alt: "2026: 326 days spent, 39 days left. Today is Nov 23, 2026.",
    },
  ]);
});

test("a weekends share stamps the day on the image but not the URL", () => {
  const meta = shareMetadata({ chart: "weekends" }, NOVEMBER_23);
  expect(meta.title).toBe("Perspective — 5 weekends left");
  expect(meta.alternates).toEqual({ canonical: "/?chart=weekends" });
  expect(meta.openGraph).toMatchObject({
    url: "/?chart=weekends",
    description: "52 weekends: 47 spent, 5 left. Next weekend is Nov 28.",
  });
  const images =
    meta.openGraph && "images" in meta.openGraph ? meta.openGraph.images : null;
  expect(images).toMatchObject([{ url: "/api/og?chart=weekends&d=2026-11-23" }]);
});

test("a summers share points at the matching image", () => {
  const meta = shareMetadata(
    { chart: "summers", age: 6, horizon: 85 },
    NOVEMBER_23,
  );
  expect(meta.title).toBe("Perspective — 79 summers");
  expect(meta.description).toBe(
    "85 summers from age 0 to 85: 6 spent, 79 left.",
  );
  expect(meta.alternates).toEqual({
    canonical: "/?chart=summers&age=6&horizon=85",
  });
  expect(meta.twitter).toMatchObject({
    card: "summary_large_image",
    title: "Perspective — 79 summers",
    description: "85 summers from age 0 to 85: 6 spent, 79 left.",
  });
  expect(meta.twitter && "images" in meta.twitter ? meta.twitter.images : null)
    .toEqual([
      {
        url: "/api/og?chart=summers&age=6&horizon=85",
        alt: "85 summers from age 0 to 85: 6 spent, 79 left.",
      },
    ]);
});

test("a visits share points at the matching image", () => {
  const meta = shareMetadata(
    { chart: "visits", age: 75, rate: 2, horizon: 85 },
    NOVEMBER_23,
  );
  expect(meta.title).toBe("Perspective — 240 visits");
  expect(meta.description).toBe(
    "360 visits from age 70 to 85: 120 visits spent, 240 visits left, at 2 visits a month.",
  );
  expect(meta.alternates).toEqual({
    canonical: "/?chart=visits&age=75&rate=2&horizon=85",
  });
  const images =
    meta.openGraph && "images" in meta.openGraph ? meta.openGraph.images : null;
  expect(images).toMatchObject([
    { url: "/api/og?chart=visits&age=75&rate=2&horizon=85", width: 1200 },
  ]);
});

test("a zero-left share still renders a card", () => {
  const summers = shareMetadata(
    { chart: "summers", age: 85, horizon: 85 },
    NOVEMBER_23,
  );
  expect(summers.title).toBe("Perspective — 0 summers");
  expect(summers.description).toBe(
    "85 summers from age 0 to 85: 85 spent, 0 left.",
  );

  const visits = shareMetadata(
    { chart: "visits", age: 85, rate: 2, horizon: 85 },
    NOVEMBER_23,
  );
  expect(visits.title).toBe("Perspective — 0 visits");
  expect(visits.alternates).toEqual({
    canonical: "/?chart=visits&age=85&rate=2&horizon=85",
  });
});
