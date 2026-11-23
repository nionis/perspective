import type { WeekendLayout } from "../time.ts";
import { Plate } from "./Plate.tsx";
import styles from "./WeekendChart.module.css";

export function WeekendChart({
  year,
  weekends,
}: {
  year: number;
  weekends: WeekendLayout;
}) {
  const total = weekends.weekends.length;
  const spent = total - weekends.left;
  const { next } = weekends;
  const nextDate =
    next === null
      ? null
      : new Date(
          year,
          0,
          weekends.startDay + next * 7,
        ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label = `${total} weekends: ${spent} spent, ${weekends.left} left.${nextDate ? ` Next weekend is ${nextDate}.` : ""}`;

  return (
    <Plate title="The year, in weekends" meta={`${weekends.left} left`}>
      <div role="img" aria-label={label}>
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
