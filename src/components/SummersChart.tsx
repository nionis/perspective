import { DEFAULT_HORIZON, summersSpan } from "../life.ts";
import { InlineNumber } from "./InlineNumber.tsx";
import { NumberField } from "./NumberField.tsx";
import { Plate } from "./Plate.tsx";
import { UnitGrid } from "./UnitGrid.tsx";
import { parseCount } from "./parseCount.ts";
import { useStoredState } from "./useStoredState.ts";
import styles from "./SummersChart.module.css";

const AGE_MAX = 120;

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function SummersChart() {
  const [age, setAge] = useStoredState("summers.age", "0");
  const [horizon, setHorizon] = useStoredState(
    "summers.horizon",
    String(DEFAULT_HORIZON),
  );

  const ageValue = parseCount(age, 0, AGE_MAX);
  const horizonValue = parseCount(horizon, 0, AGE_MAX) ?? DEFAULT_HORIZON;
  const span = ageValue === null ? null : summersSpan(ageValue, horizonValue);
  const meta = span ? plural(span.left, "summer") : "—";

  return (
    <Plate title="Your summers left" meta={meta} live>
      <div className={styles.controls}>
        <NumberField
          label="Your age"
          value={age}
          onChange={setAge}
          min={0}
          max={AGE_MAX}
        />
      </div>

      {span === null ? (
        age.trim() === "" ? null : (
          <p className={styles.empty}>
            {`Enter a whole age from 0 to ${AGE_MAX}.`}
          </p>
        )
      ) : (
        <>
          {span.left === 0 ? (
            <p className={styles.empty}>
              {`No summers left by age ${horizonValue}.`}
            </p>
          ) : (
            <UnitGrid
              count={span.spent + span.left}
              spent={span.spent}
              label={`${span.spent + span.left} summers from age 0 to ${horizonValue}: ${span.spent} spent, ${span.left} left.`}
            />
          )}
          <p className={styles.caption}>
            One block a summer · until age{" "}
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
