import type { ReactNode } from "react";
import styles from "./Plate.module.css";

export function Plate({
  title,
  meta,
  live = false,
  children,
}: {
  title: string;
  meta: string;
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={styles.plate}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.meta} aria-live={live ? "polite" : undefined}>
          {meta}
        </p>
      </div>
      {children}
    </section>
  );
}
