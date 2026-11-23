import type { CSSProperties } from "react";
import type { YearLayout } from "../time.ts";
import styles from "./YearGridChart.module.css";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = [
  { label: "Mon", row: 2 },
  { label: "Wed", row: 4 },
  { label: "Fri", row: 6 },
];

function monthColumn(
  year: number,
  month: number,
  startWeekday: number,
): number {
  const offset = Math.round(
    (Date.UTC(year, month, 1) - Date.UTC(year, 0, 1)) / 86_400_000,
  );
  return Math.floor((startWeekday + offset) / 7) + 1;
}

export function YearGridChart({
  year,
  layout,
}: {
  year: number;
  layout: YearLayout;
}) {
  const { startWeekday, columns, days } = layout;
  const spent = days.indexOf("today");
  const left = days.length - spent;
  const localeDate = new Date(year, 0, spent + 1).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const trailing = columns * 7 - startWeekday - days.length;
  const style = { "--columns": columns } as CSSProperties;

  return (
    <div className={styles.wrapper} style={style}>
      <div
        className={styles.scroller}
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
              aria-label={`${year}: ${spent} days spent, ${left} days left. Today is ${localeDate}.`}
            >
              {Array.from({ length: startWeekday }, (_, index) => (
                <span key={`lead-${index}`} className={styles.blank} aria-hidden="true" />
              ))}
              {days.map((status, index) => (
                <span
                  key={index}
                  className={`${styles.cell} ${styles[status]}`}
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
