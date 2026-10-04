import { useState } from "react";
import { SiteFooter, SiteHeader } from "../components/Layout.tsx";
import {
  parseNonNegativeInt,
  percentOfYearLeft,
  personTimeResult,
  weekendsLeft,
  type VisitUnit,
} from "../time.ts";
import styles from "./Home.module.css";

const UNITS = ["week", "month", "year"] as const;

function isVisitUnit(value: string): value is VisitUnit {
  return UNITS.some((unit) => unit === value);
}

function visitLabel(visits: number): string {
  return visits === 1 ? "visit left" : "visits left";
}

function weekendLabel(weekends: number): string {
  return weekends === 1 ? "weekend left" : "weekends left";
}

export function Home() {
  const today = new Date();
  const percent = percentOfYearLeft(today);
  const weekends = weekendsLeft(today);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [count, setCount] = useState("");
  const [unit, setUnit] = useState<VisitUnit>("week");

  const parsedAge = parseNonNegativeInt(age);
  const parsedCount = parsedAge === null ? null : parseNonNegativeInt(count);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <SiteHeader />
        <div className={styles.heroInner}>
          <p className={styles.wordmark}>Perspective</p>
          <h1 className={styles.headline}>See the time still left.</h1>
          <div className={styles.heroStats}>
            <div>
              <p className={styles.heroValue}>{percent}%</p>
              <p className={styles.heroLabel}>of the year left</p>
            </div>
            <div>
              <p className={styles.heroValue}>{weekends}</p>
              <p className={styles.heroLabel}>{weekendLabel(weekends)}</p>
            </div>
          </div>
        </div>
        <div className={styles.glow} aria-hidden />
        <div className={styles.grain} aria-hidden />
      </div>

      <section className={styles.section} aria-labelledby="visits-heading">
        <div className={styles.sectionInner}>
          <p className={styles.eyebrow}>One person</p>
          <h2 id="visits-heading">Visits still ahead</h2>
          <p className={styles.lead}>
            Measured against age 85. A week is 52 visits a year, a month is 12,
            and a year is 1.
          </p>
          <div className={styles.card}>
            <div className={styles.fields}>
              <div className={`${styles.field} ${styles.span}`}>
                <label className={styles.label} htmlFor="person-name">
                  Name
                </label>
                <input
                  id="person-name"
                  className={styles.input}
                  type="text"
                  autoComplete="off"
                  placeholder="Grandma"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="person-age">
                  Age
                </label>
                <input
                  id="person-age"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="person-count">
                  Times you see them
                </label>
                <input
                  id="person-count"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={count}
                  onChange={(event) => setCount(event.target.value)}
                />
              </div>
              <div className={`${styles.field} ${styles.span}`}>
                <label className={styles.label} htmlFor="person-unit">
                  Per
                </label>
                <select
                  id="person-unit"
                  className={styles.input}
                  value={unit}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (isVisitUnit(value)) setUnit(value);
                  }}
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
            <div className={styles.result} aria-live="polite">
              <PersonResult
                name={name}
                unit={unit}
                parsedAge={parsedAge}
                parsedCount={parsedCount}
              />
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function PersonResult({
  name,
  unit,
  parsedAge,
  parsedCount,
}: {
  name: string;
  unit: VisitUnit;
  parsedAge: number | null;
  parsedCount: number | null;
}) {
  if (parsedAge === null) {
    return (
      <p className={styles.hint}>Enter an age and how often you see them.</p>
    );
  }

  if (parsedAge > 85) {
    const result = personTimeResult({
      name: name.trim() || "They",
      age: parsedAge,
      count: 0,
      unit,
    });
    return (
      <p className={styles.message}>
        {result.kind === "message" ? result.message : null}
      </p>
    );
  }

  if (parsedAge === 85) {
    const result = personTimeResult({
      name: name.trim(),
      age: 85,
      count: 0,
      unit,
    });
    const visits = result.kind === "visits" ? result.visits : 0;
    return (
      <>
        <p className={styles.resultValue}>{visits}</p>
        <p className={styles.resultLabel}>{visitLabel(visits)}</p>
      </>
    );
  }

  if (parsedCount === null) {
    return (
      <p className={styles.hint}>Enter an age and how often you see them.</p>
    );
  }

  const result = personTimeResult({
    name: name.trim(),
    age: parsedAge,
    count: parsedCount,
    unit,
  });
  const visits = result.kind === "visits" ? result.visits : 0;
  return (
    <>
      <p className={styles.resultValue}>{visits}</p>
      <p className={styles.resultLabel}>{visitLabel(visits)}</p>
    </>
  );
}
