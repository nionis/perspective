"use client";

import {
  AGE_MAX,
  DEFAULT_HORIZON,
  DEFAULT_VISITS_AGE,
  DEFAULT_VISITS_RATE,
  VISITS_PER_MONTH_MAX,
} from "../life.ts";
import { VISITS_TITLE, visitsCopy } from "../copy.ts";
import { InlineNumber } from "./InlineNumber.tsx";
import { NumberField } from "./NumberField.tsx";
import { Plate } from "./Plate.tsx";
import { UnitGrid } from "./UnitGrid.tsx";
import { parseCount } from "./parseCount.ts";
import { ShareButton } from "./ShareButton.tsx";
import { useShareFocus } from "./ShareFocus.ts";
import { useStoredState } from "./useStoredState.ts";
import styles from "./VisitsChart.module.css";

export function VisitsChart() {
  const { params, dismiss } = useShareFocus();
  const shared = params?.chart === "visits" ? params : null;
  const [age, setAge] = useStoredState(
    "visits.age",
    String(DEFAULT_VISITS_AGE),
    shared ? String(shared.age) : undefined,
  );
  const [visits, setVisits] = useStoredState(
    "visits.rate",
    String(DEFAULT_VISITS_RATE),
    shared ? String(shared.rate) : undefined,
  );
  const [horizon, setHorizon] = useStoredState(
    "visits.horizon",
    String(DEFAULT_HORIZON),
    shared ? String(shared.horizon) : undefined,
  );

  const ageValue = parseCount(age, 0, AGE_MAX);
  const visitsValue = parseCount(visits, 0, VISITS_PER_MONTH_MAX);
  const horizonInput = parseCount(horizon, 0, AGE_MAX);
  const horizonValue = horizonInput ?? DEFAULT_HORIZON;
  const copy =
    ageValue === null || visitsValue === null
      ? null
      : visitsCopy(ageValue, visitsValue, horizonValue);

  const changeAge = (next: string) => {
    if (shared) dismiss({ keepScroll: true });
    setAge(next);
  };
  const changeVisits = (next: string) => {
    if (shared) dismiss({ keepScroll: true });
    setVisits(next);
  };
  const changeHorizon = (next: string) => {
    if (shared) dismiss({ keepScroll: true });
    setHorizon(next);
  };

  return (
    <Plate
      chart="visits"
      title={VISITS_TITLE}
      meta={copy?.meta ?? "—"}
      live
      actions={
        ageValue === null ||
        visitsValue === null ||
        horizonInput === null ? null : (
          <ShareButton
            chart="visits"
            age={ageValue}
            rate={visitsValue}
            horizon={horizonInput}
          />
        )
      }
    >
      <div className={styles.controls}>
        <NumberField
          label="Their age"
          value={age}
          onChange={changeAge}
          min={0}
          max={AGE_MAX}
        />
        <NumberField
          label="Visits a month"
          value={visits}
          onChange={changeVisits}
          min={0}
          max={VISITS_PER_MONTH_MAX}
        />
      </div>

      {copy === null ? (
        <p className={styles.empty}>
          {`Enter whole numbers: age 0–${AGE_MAX}, visits a month 0–${VISITS_PER_MONTH_MAX}.`}
        </p>
      ) : (
        <>
          {copy.left === 0 ? (
            <p className={styles.empty}>{copy.empty}</p>
          ) : (
            <UnitGrid
              count={copy.total}
              spent={copy.spent}
              label={copy.label}
            />
          )}
          <p className={styles.caption}>
            {copy.captionPrefix}
            <InlineNumber
              label="Horizon age"
              value={horizon}
              onChange={changeHorizon}
              max={AGE_MAX}
            />
          </p>
        </>
      )}
    </Plate>
  );
}
