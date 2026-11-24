import type { ReactNode } from "react";
import {
  MONTHS,
  WEEKDAYS,
  shareCopy,
  summersCopy,
  visitsCopy,
} from "../../../copy.ts";
import { SITE_URL } from "../../../site.ts";
import type { ShareParams } from "../../../share/share.ts";
import type { DayStatus, YearLayout } from "../../../time.ts";
import { monthColumn, weekendLayout, yearLayout } from "../../../time.ts";
import { UNIT_TILE, unitGridGeometry } from "../../../unitGrid.ts";

const BG = "#0A0A0A";
const INK = "#F2EEE6";
const MUTED = "#A39E95";
const LINE = "#242424";
const SPENT = "#2E2E2E";

const MONO = "IBM Plex Mono";
const WIDTH = 1056;
const CHART_HEIGHT = 330;
const RING = 1.5;

const SITE_HOST = new URL(SITE_URL).host.toUpperCase();

function fill(status: DayStatus): string {
  return status === "spent" ? SPENT : INK;
}

function DaysChart({ layout }: { layout: YearLayout }) {
  const { year, startWeekday, columns, days } = layout;
  const gap = 3;
  const gutter = 32;
  const gridTop = 26;
  const cell = (WIDTH - gutter - (columns - 1) * gap) / columns;
  const gridHeight = 7 * cell + 6 * gap;
  const swatches = [
    { fill: SPENT, label: "Spent" },
    { fill: INK, label: "Left" },
    { fill: "none", label: "Today" },
  ];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: WIDTH,
        height: gridTop + gridHeight + 32,
      }}
    >
      {MONTHS.map((label, index) => (
        <div
          key={label}
          style={{
            position: "absolute",
            top: 0,
            left: gutter + (monthColumn(year, index, startWeekday) - 1) * (cell + gap),
            fontSize: 11,
            letterSpacing: 1,
            color: MUTED,
          }}
        >
          {label.toUpperCase()}
        </div>
      ))}
      {WEEKDAYS.map(({ label, row }) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: 0,
            top: gridTop + (row - 1) * (cell + gap),
            width: gutter - 8,
            height: cell,
            lineHeight: `${cell}px`,
            fontSize: 11,
            letterSpacing: 1,
            color: MUTED,
          }}
        >
          {label.toUpperCase()}
        </div>
      ))}
      <svg
        width={WIDTH}
        height={gridHeight}
        viewBox={`0 0 ${WIDTH} ${gridHeight}`}
        style={{ position: "absolute", top: gridTop, left: 0 }}
      >
        {days.map((status, index) => {
          const slot = startWeekday + index;
          const x = gutter + Math.floor(slot / 7) * (cell + gap);
          const y = (slot % 7) * (cell + gap);
          return status === "today" ? (
            <rect
              key={index}
              x={x + RING / 2}
              y={y + RING / 2}
              width={cell - RING}
              height={cell - RING}
              fill={BG}
              stroke={INK}
              strokeWidth={RING}
            />
          ) : (
            <rect
              key={index}
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill={fill(status)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: gridTop + gridHeight + 10,
          left: gutter,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 12,
          color: MUTED,
        }}
      >
        {swatches.map(({ fill: color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                background: color === "none" ? BG : color,
                border: color === "none" ? `1px solid ${INK}` : "none",
              }}
            />
            <div style={{ letterSpacing: 1 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekendsChart({ layout }: { layout: YearLayout }) {
  const weekends = weekendLayout(layout);
  const columns = 13;
  const gap = 6;
  const pairWidth = (WIDTH - (columns - 1) * gap) / columns;
  const cell = (pairWidth - 2) / 2;
  const rows = Math.ceil(weekends.weekends.length / columns);
  const height = rows * cell + (rows - 1) * gap;

  return (
    <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`}>
      {weekends.weekends.map((weekend, index) => {
        const x = (index % columns) * (pairWidth + gap);
        const y = Math.floor(index / columns) * (cell + gap);
        return (
          <g key={index}>
            {weekend.days.map((status, day) => {
              const left = x + day * (cell + 2);
              return status === "today" ? (
                <rect
                  key={day}
                  x={left + RING / 2}
                  y={y + RING / 2}
                  width={cell - RING}
                  height={cell - RING}
                  fill={BG}
                  stroke={INK}
                  strokeWidth={RING}
                />
              ) : (
                <rect
                  key={day}
                  x={left}
                  y={y}
                  width={cell}
                  height={cell}
                  fill={fill(status)}
                />
              );
            })}
            {index === weekends.next ? (
              <rect
                x={x - 2}
                y={y - 2}
                width={pairWidth + 4}
                height={cell + 4}
                fill="none"
                stroke={INK}
                strokeWidth={1}
                strokeDasharray="2 3"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function UnitChart({
  count,
  spent,
}: {
  count: number;
  spent: number;
}) {
  const geometry = unitGridGeometry(count, spent);
  const scale = Math.min(
    WIDTH / geometry.width,
    CHART_HEIGHT / geometry.height,
  );
  const width = geometry.width * scale;
  const height = geometry.height * scale;
  const halves = [
    { from: 0, to: spent, color: SPENT, rects: geometry.spentRects },
    { from: spent, to: count, color: INK, rects: geometry.leftRects },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}

    >
      <defs>
        {halves.map(({ from, color }) => (
          <pattern
            key={from}
            id={`p-${from}`}
            width={UNIT_TILE}
            height={UNIT_TILE}
            patternUnits="userSpaceOnUse"
          >
            <rect width="1" height="1" fill={color} />
          </pattern>
        ))}
        {halves.map(({ from, rects }) => (
          <clipPath key={`c-${from}`} id={`c-${from}`}>
            {rects.map((rect, index) => (
              <rect
                key={index}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
              />
            ))}
          </clipPath>
        ))}
      </defs>
      {halves.map(({ from }) => (
        <rect
          key={from}
          width={geometry.width}
          height={geometry.height}
          fill={`url(#p-${from})`}
          clipPath={`url(#c-${from})`}
        />
      ))}
    </svg>
  );
}

export function ShareCard({
  params,
  date,
}: {
  params: ShareParams;
  date: Date;
}) {
  const copy = shareCopy(params, date);
  const heading = copy.title.toUpperCase();

  let chart: ReactNode;
  if (params.chart === "days") {
    chart = <DaysChart layout={yearLayout(date)} />;
  } else if (params.chart === "weekends") {
    const layout = yearLayout(date);
    chart = <WeekendsChart layout={layout} />;
  } else if (params.chart === "summers") {
    const personal = summersCopy(params.age, params.horizon);
    chart =
      personal.left === 0 ? (
        <div style={{ display: "flex", fontSize: 24 }}>{personal.empty}</div>
      ) : (
        <UnitChart count={personal.total} spent={personal.spent} />
      );
  } else {
    const personal = visitsCopy(params.age, params.rate, params.horizon);
    chart =
      personal.left === 0 ? (
        <div style={{ display: "flex", fontSize: 24 }}>{personal.empty}</div>
      ) : (
        <UnitChart count={personal.total} spent={personal.spent} />
      );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: BG,
        color: MUTED,
        fontFamily: MONO,
        lineHeight: 1,
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          letterSpacing: 3,
        }}
      >
        <div>PERSPECTIVE</div>
        <div>{heading}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: CHART_HEIGHT,
          marginTop: 24,
        }}
      >
        {chart}
      </div>
      <div style={{ height: 1, background: LINE, marginTop: 24 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 24,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 2 }}>{copy.meta.toUpperCase()}</div>
        <div style={{ fontSize: 16, letterSpacing: 1.5 }}>
          {copy.imageCaption.toUpperCase()}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontSize: 16, letterSpacing: 1.5 }}>
          {copy.shareLine.toUpperCase()}
        </div>
        <div style={{ fontSize: 16, letterSpacing: 1.5 }}>{SITE_HOST}</div>
      </div>
    </div>
  );
}
