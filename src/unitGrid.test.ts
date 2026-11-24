import { expect, test } from "vitest";
import {
  UNIT_GAP,
  UNIT_MIN_COLUMNS,
  UNIT_TILE,
  unitGridColumns,
  unitGridGeometry,
  unitGridRects,
} from "./unitGrid.ts";

test("columns track the square root of the count", () => {
  expect(unitGridColumns(1)).toBe(UNIT_MIN_COLUMNS);
  expect(unitGridColumns(85)).toBe(26);
  expect(unitGridColumns(400)).toBe(40);
  expect(unitGridColumns(18_600)).toBe(273);
});

test("no cell is larger than a weekend cell and the block stays wide", () => {
  for (const count of [1, 85, 360, 2_040, 18_600]) {
    const columns = unitGridColumns(count);
    const { rows } = unitGridGeometry(count, 0, columns);
    expect(columns).toBeGreaterThanOrEqual(UNIT_MIN_COLUMNS);
    expect(columns / Math.max(1, rows)).toBeGreaterThan(2);
  }
});

test("rows clip the first and last row of a half", () => {
  expect(unitGridRects(0, 10, 4)).toEqual([
    { x: 0, y: 0, width: 4 + 3 * UNIT_GAP, height: 1 },
    { x: 0, y: UNIT_TILE, width: 4 + 3 * UNIT_GAP, height: 1 },
    { x: 0, y: 2 * UNIT_TILE, width: 2 + UNIT_GAP, height: 1 },
  ]);
  expect(unitGridRects(6, 9, 4)).toEqual([
    { x: 2 * UNIT_TILE, y: UNIT_TILE, width: 2 + UNIT_GAP, height: 1 },
    { x: 0, y: 2 * UNIT_TILE, width: 1, height: 1 },
  ]);
  expect(unitGridRects(8, 8, 4)).toEqual([]);
});

test("the halves cover every cell exactly once", () => {
  const count = 360;
  const spent = 120;
  for (const columns of [26, 37, 273]) {
    const geometry = unitGridGeometry(count, spent, columns);
    const rows = Math.ceil(count / columns);
    expect(geometry.width).toBeCloseTo(columns + (columns - 1) * UNIT_GAP);
    expect(geometry.height).toBeCloseTo(rows + (rows - 1) * UNIT_GAP);

    const covered = new Map<string, number>();
    for (const [from, rects] of [
      [0, geometry.spentRects],
      [spent, geometry.leftRects],
    ] as const) {
      let cell = from;
      for (const rect of rects) {
        const cells = Math.round((rect.width + UNIT_GAP) / UNIT_TILE);
        for (let offset = 0; offset < cells; offset += 1) {
          const key = `${rect.y}:${rect.x + offset * UNIT_TILE}`;
          covered.set(key, (covered.get(key) ?? 0) + 1);
          cell += 1;
        }
      }
      expect(cell).toBe(from === 0 ? spent : count);
    }
    expect(covered.size).toBe(count);
    expect([...covered.values()].every((hits) => hits === 1)).toBe(true);
    for (const rect of [...geometry.spentRects, ...geometry.leftRects]) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(geometry.width + 1e-9);
      expect(rect.y + rect.height).toBeLessThanOrEqual(geometry.height + 1e-9);
    }
  }
});
