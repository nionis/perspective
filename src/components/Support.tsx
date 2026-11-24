import { SiteFooter, SiteHeader } from "./Layout.tsx";
import {
  DONATION_YEAR,
  NAMED_SUPPORTERS,
  RAISED_EUR,
  SUPPORT_URL,
  YEAR_GOAL_EUR,
  formatEur,
} from "../content/donations.ts";
import styles from "./Support.module.css";

const supporters = NAMED_SUPPORTERS.map((donor) => ({
  name: donor.name?.trim() ?? "",
  image: donor.image?.trim() ?? "",
  x: donor.x?.trim() ?? "",
  amountEur: donor.amountEur,
}));

function xHandle(url: string): string {
  try {
    const handle = new URL(url).pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : url;
  } catch {
    return url;
  }
}

export function Support() {
  const remaining = Math.max(0, YEAR_GOAL_EUR - RAISED_EUR);
  const pct =
    YEAR_GOAL_EUR <= 0
      ? 0
      : Math.min(100, (RAISED_EUR / YEAR_GOAL_EUR) * 100);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <p className={styles.eyebrow}>{DONATION_YEAR} goal</p>
        <h1 className={styles.title}>Support</h1>
        <p className={styles.lead}>
          Perspective is free, with no accounts and no ads. Hosting for the
          year is a {formatEur(YEAR_GOAL_EUR)} goal.
        </p>

        <section className={styles.goal}>
          <div className={styles.stats}>
            <div>
              <p className={styles.statLabel}>Raised</p>
              <p className={styles.statValue}>{formatEur(RAISED_EUR)}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Remaining</p>
              <p className={styles.statValue}>{formatEur(remaining)}</p>
            </div>
          </div>

          <div
            className={styles.track}
            role="progressbar"
            aria-label={`${DONATION_YEAR} fundraising progress`}
            aria-valuemin={0}
            aria-valuemax={YEAR_GOAL_EUR}
            aria-valuenow={Math.min(RAISED_EUR, YEAR_GOAL_EUR)}
            aria-valuetext={`${formatEur(RAISED_EUR)} of ${formatEur(YEAR_GOAL_EUR)}`}
          >
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.caption}>
            {formatEur(RAISED_EUR)} of {formatEur(YEAR_GOAL_EUR)}
          </p>

          <a
            className={styles.action}
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Support us ↗
          </a>
        </section>

        <section className={styles.supportersSection}>
          <h2 id="supporters-heading" className={styles.supportersHeading}>
            This year's supporters
          </h2>
          {supporters.length === 0 ? (
            <p className={styles.empty}>
              No named supporters yet. Gifts stay anonymous unless you choose
              to share your name or social account.
            </p>
          ) : (
            <ul
              className={styles.supporters}
              aria-labelledby="supporters-heading"
            >
              {supporters.map((supporter, index) => {
                const card = (
                  <>
                    {supporter.image ? (
                      <img
                        className={styles.portrait}
                        src={supporter.image}
                        alt=""
                      />
                    ) : (
                      <span
                        className={styles.portrait}
                        aria-hidden="true"
                      />
                    )}
                    {supporter.name ? (
                      <span className={styles.supporterName}>
                        {supporter.name}
                      </span>
                    ) : null}
                    {supporter.amountEur != null ? (
                      <span className={styles.supporterAmount}>
                        {formatEur(supporter.amountEur)}
                      </span>
                    ) : null}
                    {supporter.x ? (
                      <span className={styles.supporterX}>
                        {xHandle(supporter.x)}
                      </span>
                    ) : null}
                  </>
                );

                return (
                  <li
                    key={`${supporter.name}-${supporter.x}-${supporter.image}-${index}`}
                  >
                    {supporter.x ? (
                      <a
                        className={styles.supporterCard}
                        href={supporter.x}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {card}
                      </a>
                    ) : (
                      <div className={styles.supporterCard}>{card}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
