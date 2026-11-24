"use client";

import { weekendsCopy } from "../copy.ts";
import type { WeekendLayout } from "../time.ts";
import { Plate } from "./Plate.tsx";
import { ShareButton } from "./ShareButton.tsx";
import styles from "./WeekendChart.module.css";

export function WeekendChart({
  year,
  weekends,
  today,
}: {
  year: number;
  weekends: WeekendLayout;
  today: Date;
}) {
  const { next } = weekends;
  const copy = weekendsCopy(year, weekends);

  return (
    <Plate
      chart="weekends"
      title={copy.title}
      meta={copy.meta}
      actions={<ShareButton chart="weekends" date={today} />}
    >
      <div role="img" aria-label={copy.label}>
        <div className={styles.grid} aria-hidden="true">
          {weekends.weekends.map((weekend, index) => (
            <span
              key={index}
              className={`${styles.weekend}${
                index === next ? ` ${styles.next}` : ""
              }`}
            >
              {weekend.days.map((status, day) => (
                <span
                  key={day}
                  className={`${styles.cell} ${styles[status]}`}
                />
              ))}
            </span>
          ))}
        </div>
      </div>
    </Plate>
  );
}
