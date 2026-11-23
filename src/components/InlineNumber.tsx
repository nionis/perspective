import styles from "./InlineNumber.module.css";

export function InlineNumber({
  label,
  value,
  onChange,
  min = 0,
  max = 120,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      className={styles.input}
      type="number"
      inputMode="numeric"
      autoComplete="off"
      min={min}
      max={max}
      step={1}
      aria-label={label}
      value={value}
      size={3}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
