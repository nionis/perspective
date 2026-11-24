"use client";

import {
  AGE_MAX,
  DEFAULT_HORIZON,
  DEFAULT_SUMMERS_AGE,
} from "../life.ts";
import {
  SUMMERS_CAPTION_PREFIX,
  SUMMERS_TITLE,
  summersCopy,
} from "../copy.ts";
import { InlineNumber } from "./InlineNumber.tsx";
import { NumberField } from "./NumberField.tsx";
import { Plate } from "./Plate.tsx";
import { UnitGrid } from "./UnitGrid.tsx";
import { parseCount } from "./parseCount.ts";
import { ShareButton } from "./ShareButton.tsx";
import { useShareFocus } from "./ShareFocus.ts";
import { useStoredState } from "./useStoredState.ts";
import styles from "./SummersChart.module.css";

export function SummersChart() {
  const { params, dismiss } = useShareFocus();
  const shared = params?.chart === "summers" ? params : null;
  const [age, setAge] = useStoredState(
    "summers.age",
    String(DEFAULT_SUMMERS_AGE),
    shared ? String(shared.age) : undefined,
  );
  const [horizon, setHorizon] = useStoredState(
    "summers.horizon",
    String(DEFAULT_HORIZON),
    shared ? String(shared.horizon) : undefined,
  );

  const ageValue = parseCount(age, 0, AGE_MAX);
  const horizonInput = parseCount(horizon, 0, AGE_MAX);
  const horizonValue = horizonInput ?? DEFAULT_HORIZON;
  const copy = ageValue === null ? null : summersCopy(ageValue, horizonValue);

  const changeAge = (next: string) => {
    if (shared) dismiss({ keepScroll: true });
    setAge(next);
  };
  const changeHorizon = (next: string) => {
    if (shared) dismiss({ keepScroll: true });
    setHorizon(next);
  };

  return (
    <Plate
      chart="summers"
      title={SUMMERS_TITLE}
      meta={copy?.meta ?? "—"}
      live
      actions={
        ageValue === null || horizonInput === null ? null : (
          <ShareButton
            chart="summers"
            age={ageValue}
            horizon={horizonInput}
          />
        )
      }
    >
      <div className={styles.controls}>
        <NumberField
          label="Your age"
          value={age}
          onChange={changeAge}
          min={0}
          max={AGE_MAX}
        />
      </div>

      {copy === null ? (
        age.trim() === "" ? null : (
          <p className={styles.empty}>
            {`Enter a whole age from 0 to ${AGE_MAX}.`}
          </p>
        )
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
            {SUMMERS_CAPTION_PREFIX}
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
