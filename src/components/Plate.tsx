"use client";

import type { ReactNode } from "react";
import type { ShareChart } from "../share/share.ts";
import { useShareFocus } from "./ShareFocus.ts";
import styles from "./Plate.module.css";

export function Plate({
  chart,
  title,
  meta,
  live = false,
  actions,
  children,
}: {
  chart: ShareChart;
  title: string;
  meta: string;
  live?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { params } = useShareFocus();
  const dimmed = params !== null && params.chart !== chart;

  return (
    <section
      id={`chart-${chart}`}
      className={`${styles.plate}${dimmed ? ` ${styles.dimmed}` : ""}`}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.headMeta}>
          <p className={styles.meta} aria-live={live ? "polite" : undefined}>
            {meta}
          </p>
          {actions}
        </div>
      </div>
      {children}
    </section>
  );
}
