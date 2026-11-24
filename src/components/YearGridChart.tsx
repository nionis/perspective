"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { MONTHS, WEEKDAYS, daysCopy } from "../copy.ts";
import { monthColumn } from "../time.ts";
import type { YearLayout } from "../time.ts";
import styles from "./YearGridChart.module.css";

export function YearGridChart({
  year,
  layout,
}: {
  year: number;
  layout: YearLayout;
}) {
  const { startWeekday, columns, days } = layout;
  const copy = daysCopy(layout);
  const trailing = columns * 7 - startWeekday - days.length;
  const style = { "--columns": columns } as CSSProperties;

  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const today = scroller.querySelector<HTMLElement>("[data-today]");
    if (!today) return;
    const viewport = scroller.getBoundingClientRect();
    const cell = today.getBoundingClientRect();
    if (cell.left >= viewport.left && cell.right <= viewport.right) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const centered =
      scroller.scrollLeft +
      cell.left -
      viewport.left -
      (scroller.clientWidth - cell.width) / 2;
    scroller.scrollLeft = Math.min(max, Math.max(0, centered));
  }, []);

  return (
    <div className={styles.wrapper} style={style}>
      <div
        className={styles.scroller}
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-label="Year grid"
      >
        <div className={styles.inner}>
          <div className={styles.months} aria-hidden="true">
            {MONTHS.map((month, index) => (
              <span
                key={month}
                style={{
                  gridColumn: monthColumn(year, index, startWeekday),
                }}
              >
                {month}
              </span>
            ))}
          </div>
          <div className={styles.body}>
            <div className={styles.weekdays} aria-hidden="true">
              {WEEKDAYS.map(({ label, row }) => (
                <span key={label} style={{ gridRow: row }}>
                  {label}
                </span>
              ))}
            </div>
            <div
              className={styles.grid}
              role="img"
              aria-label={copy.label}
            >
              {Array.from({ length: startWeekday }, (_, index) => (
                <span key={`lead-${index}`} className={styles.blank} aria-hidden="true" />
              ))}
              {days.map((status, index) => (
                <span
                  key={index}
                  className={`${styles.cell} ${styles[status]}`}
                  data-today={status === "today" ? "" : undefined}
                  aria-hidden="true"
                />
              ))}
              {Array.from({ length: trailing }, (_, index) => (
                <span key={`trail-${index}`} className={styles.blank} aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ul className={styles.legend}>
        <li>
          <span className={`${styles.swatch} ${styles.spent}`} aria-hidden="true" />
          spent
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.left}`} aria-hidden="true" />
          left
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.today}`} aria-hidden="true" />
          today
        </li>
      </ul>
    </div>
  );
}
