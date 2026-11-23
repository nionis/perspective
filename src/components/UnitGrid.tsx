import { useId } from "react";
import styles from "./UnitGrid.module.css";

const GAP = 0.14;
const TILE = 1 + GAP;
const ASPECT = 4;
const MIN_COLUMNS = 26;

function rangeRects(from: number, to: number, columns: number) {
  const rects = [];
  for (let row = Math.floor(from / columns); row * columns < to; row += 1) {
    const start = Math.max(from, row * columns);
    const end = Math.min(to, (row + 1) * columns);
    const cells = end - start;
    if (cells <= 0) continue;
    rects.push({
      x: (start - row * columns) * TILE,
      y: row * TILE,
      width: cells + (cells - 1) * GAP,
      height: 1,
    });
  }
  return rects;
}

export function UnitGrid({
  count,
  spent = 0,
  label,
  columns = Math.max(MIN_COLUMNS, Math.ceil(Math.sqrt(count * ASPECT))),
}: {
  count: number;
  spent?: number;
  label: string;
  columns?: number;
}) {
  const id = useId().replace(/:/g, "");
  const rows = Math.ceil(count / columns);
  const width = columns + (columns - 1) * GAP;
  const height = rows + (rows - 1) * GAP;
  const halves = [
    { from: 0, to: spent, pattern: "spent" },
    { from: spent, to: count, pattern: "left" },
  ];

  return (
    <svg
      className={styles.grid}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <defs>
        {halves.map(({ pattern }) => (
          <pattern
            key={pattern}
            id={`${pattern}-${id}`}
            width={TILE}
            height={TILE}
            patternUnits="userSpaceOnUse"
          >
            <rect className={styles[pattern]} width="1" height="1" />
          </pattern>
        ))}
        {halves.map(({ from, to, pattern }) => (
          <clipPath key={pattern} id={`${pattern}-clip-${id}`}>
            {rangeRects(from, to, columns).map((rect, index) => (
              <rect key={index} {...rect} />
            ))}
          </clipPath>
        ))}
      </defs>
      {halves.map(({ pattern }) => (
        <rect
          key={pattern}
          width={width}
          height={height}
          fill={`url(#${pattern}-${id})`}
          clipPath={`url(#${pattern}-clip-${id})`}
        />
      ))}
    </svg>
  );
}
