"use client";

import { useId } from "react";
import {
  UNIT_GAP,
  UNIT_TILE,
  unitGridColumns,
  unitGridRects,
} from "../unitGrid.ts";
import styles from "./UnitGrid.module.css";

export function UnitGrid({
  count,
  spent = 0,
  label,
  columns = unitGridColumns(count),
}: {
  count: number;
  spent?: number;
  label: string;
  columns?: number;
}) {
  const id = useId().replace(/:/g, "");
  const rows = Math.ceil(count / columns);
  const width = columns + (columns - 1) * UNIT_GAP;
  const height = rows + (rows - 1) * UNIT_GAP;
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
            width={UNIT_TILE}
            height={UNIT_TILE}
            patternUnits="userSpaceOnUse"
          >
            <rect className={styles[pattern]} width="1" height="1" />
          </pattern>
        ))}
        {halves.map(({ from, to, pattern }) => (
          <clipPath key={pattern} id={`${pattern}-clip-${id}`}>
            {unitGridRects(from, to, columns).map((rect, index) => (
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
