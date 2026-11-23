import { DEFAULT_HORIZON, visitsSpan, visitsStartAge } from "../life.ts";
import { InlineNumber } from "./InlineNumber.tsx";
import { NumberField } from "./NumberField.tsx";
import { Plate } from "./Plate.tsx";
import { UnitGrid } from "./UnitGrid.tsx";
import { parseCount } from "./parseCount.ts";
import { useStoredState } from "./useStoredState.ts";
import styles from "./VisitsChart.module.css";

const AGE_MAX = 120;
const VISITS_MAX = 31;

function format(value: number): string {
  return value.toLocaleString("en-US");
}

function plural(count: number, noun: string): string {
  return `${format(count)} ${noun}${count === 1 ? "" : "s"}`;
}

export function VisitsChart() {
  const [age, setAge] = useStoredState("visits.age", "75");
  const [visits, setVisits] = useStoredState("visits.rate", "2");
  const [horizon, setHorizon] = useStoredState(
    "visits.horizon",
    String(DEFAULT_HORIZON),
  );

  const ageValue = parseCount(age, 0, AGE_MAX);
  const visitsValue = parseCount(visits, 0, VISITS_MAX);
  const horizonValue = parseCount(horizon, 0, AGE_MAX) ?? DEFAULT_HORIZON;
  const values =
    ageValue === null || visitsValue === null
      ? null
      : { age: ageValue, visits: visitsValue };
  const span = values
    ? visitsSpan(values.age, values.visits, horizonValue)
    : null;
  const start = values ? visitsStartAge(values.age) : 0;
  const rate = plural(values?.visits ?? 0, "visit");
  const meta = span ? plural(span.left, "visit") : "—";

  return (
    <Plate title="Grandparents visits left" meta={meta} live>
      <div className={styles.controls}>
        <NumberField
          label="Their age"
          value={age}
          onChange={setAge}
          min={0}
          max={AGE_MAX}
        />
        <NumberField
          label="Visits a month"
          value={visits}
          onChange={setVisits}
          min={0}
          max={VISITS_MAX}
        />
      </div>

      {span === null ? (
        <p className={styles.empty}>
          {`Enter whole numbers: age 0–${AGE_MAX}, visits a month 0–${VISITS_MAX}.`}
        </p>
      ) : (
        <>
          {span.left === 0 ? (
            <p className={styles.empty}>
              {`No visits left by age ${horizonValue}.`}
            </p>
          ) : (
            <UnitGrid
              count={span.spent + span.left}
              spent={span.spent}
              label={`${plural(span.spent + span.left, "visit")} from age ${start} to ${horizonValue}: ${plural(span.spent, "visit")} spent, ${plural(span.left, "visit")} left, at ${rate} a month.`}
            />
          )}
          <p className={styles.caption}>
            {`${rate} a month · age ${start} to `}
            <InlineNumber
              label="Horizon age"
              value={horizon}
              onChange={setHorizon}
              max={AGE_MAX}
            />
          </p>
        </>
      )}
    </Plate>
  );
}
