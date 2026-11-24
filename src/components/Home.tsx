"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { daysCopy } from "../copy.ts";
import { parseShareSearch } from "../share/share.ts";
import type { ShareParams } from "../share/share.ts";
import type { DismissOptions } from "./ShareFocus.ts";
import { isoDate, weekendLayout, yearLayout } from "../time.ts";
import { SiteFooter, SiteHeader } from "./Layout.tsx";
import { Plate } from "./Plate.tsx";
import { ShareButton } from "./ShareButton.tsx";
import { ShareFocusContext } from "./ShareFocus.ts";
import { SummersChart } from "./SummersChart.tsx";
import { VisitsChart } from "./VisitsChart.tsx";
import { WeekendChart } from "./WeekendChart.tsx";
import { YearGridChart } from "./YearGridChart.tsx";
import styles from "./Home.module.css";

function useToday(): Date {
  const [today, setToday] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      setToday((current) =>
        current.toDateString() === now.toDateString() ? current : now,
      );
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}

export function Home() {
  const today = useToday();
  const layout = yearLayout(today);
  const weekends = weekendLayout(layout);
  const { year } = layout;
  const days = daysCopy(layout);

  const [share, setShare] = useState<ShareParams | null>(() =>
    parseShareSearch(new URLSearchParams(window.location.search)),
  );
  const focusedChart = share?.chart ?? null;

  const restoreY = useRef(0);
  const focusY = useRef(0);

  const dismiss = useCallback((options?: DismissOptions) => {
    setShare(null);
    window.history.replaceState(window.history.state, "", "/");
    if (!options?.keepScroll) window.scrollTo(0, restoreY.current);
  }, []);

  const focus = useMemo(
    () => ({ params: share, dismiss }),
    [share, dismiss],
  );

  useEffect(() => {
    if (!focusedChart) return;
    const plate = document.getElementById(`chart-${focusedChart}`);
    if (!plate) return;
    restoreY.current = window.scrollY;
    const top = plate.offsetTop;
    const height = plate.getBoundingClientRect().height;
    const centered =
      height < window.innerHeight
        ? top - (window.innerHeight - height) / 2
        : top;
    window.scrollTo(0, Math.max(0, centered));
    focusY.current = window.scrollY;
  }, [focusedChart]);

  useEffect(() => {
    if (!focusedChart) return;
    const onScroll = () => {
      if (Math.abs(window.scrollY - focusY.current) < window.innerHeight * 0.3) {
        return;
      }
      dismiss({ keepScroll: true });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [focusedChart, dismiss]);

  useEffect(() => {
    if (!focusedChart) return;
    const plate = document.getElementById(`chart-${focusedChart}`);
    const isOutside = (target: EventTarget | null) =>
      !(target instanceof Node) || !plate?.contains(target);
    const onPointer = (event: PointerEvent) => {
      if (isOutside(event.target)) dismiss();
    };
    const onFocus = (event: FocusEvent) => {
      if (isOutside(event.target)) dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target;
      if (target instanceof Element && target.closest('[role="menu"]')) return;
      dismiss();
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [focusedChart, dismiss]);

  return (
    <ShareFocusContext.Provider value={focus}>
      <div className={styles.page}>
        <SiteHeader
          meta={
            <time dateTime={isoDate(today)}>
              {today.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </time>
          }
        />
        <main className={styles.main}>
          <h1 className="sr-only">The time still left</h1>
          <Plate
            chart="days"
            title={days.title}
            meta={days.meta}
            actions={<ShareButton chart="days" date={today} />}
          >
            <YearGridChart year={year} layout={layout} />
          </Plate>
          <WeekendChart year={year} weekends={weekends} today={today} />
          <SummersChart />
          <VisitsChart />
        </main>
        <SiteFooter />
      </div>
    </ShareFocusContext.Provider>
  );
}
