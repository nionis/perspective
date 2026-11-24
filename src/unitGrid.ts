export const UNIT_GAP = 0.14;
export const UNIT_TILE = 1 + UNIT_GAP;
export const UNIT_ASPECT = 4;
export const UNIT_MIN_COLUMNS = 26;

export type UnitRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function unitGridColumns(count: number): number {
  return Math.max(UNIT_MIN_COLUMNS, Math.ceil(Math.sqrt(count * UNIT_ASPECT)));
}

export function unitGridRects(
  from: number,
  to: number,
  columns: number,
): UnitRect[] {
  const rects: UnitRect[] = [];
  for (let row = Math.floor(from / columns); row * columns < to; row += 1) {
    const start = Math.max(from, row * columns);
    const end = Math.min(to, (row + 1) * columns);
    const cells = end - start;
    if (cells <= 0) continue;
    rects.push({
      x: (start - row * columns) * UNIT_TILE,
      y: row * UNIT_TILE,
      width: cells + (cells - 1) * UNIT_GAP,
      height: 1,
    });
  }
  return rects;
}

export function unitGridGeometry(
  count: number,
  spent: number,
  columns = unitGridColumns(count),
) {
  const rows = Math.ceil(count / columns);
  const width = columns + (columns - 1) * UNIT_GAP;
  const height = rows + (rows - 1) * UNIT_GAP;
  return {
    columns,
    rows,
    width,
    height,
    spentRects: unitGridRects(0, spent, columns),
    leftRects: unitGridRects(spent, count, columns),
  };
}
