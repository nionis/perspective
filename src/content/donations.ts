/** Year the current €100 hosting goal applies to. */
export const DONATION_YEAR = 2026;

/** Yearly fundraising target, in euros. */
export const YEAR_GOAL_EUR = 100;

/**
 * Amount raised so far this year, in euros.
 * Update by hand until totals are wired up.
 */
export const RAISED_EUR = 0;

/** Where the Support us action sends visitors. */
export const SUPPORT_URL = "https://introspect.school/#donate-heading";

export type NamedSupporter = {
  /** Path in /public, for example "/supporters/photo.jpg". */
  image?: string;
  /** Shown only when the donor chooses to share a name. */
  name?: string;
  /** X profile, shown when the donor chooses to share it. */
  x?: string;
  /** Gift amount in euros, shown on the supporter. */
  amountEur?: number;
};

/**
 * People listed under this year's supporters.
 * Set `name` and `x` only when the donor opts in. A gift with neither
 * stays anonymous and still counts in RAISED_EUR.
 */
export const NAMED_SUPPORTERS: readonly NamedSupporter[] = [];

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
