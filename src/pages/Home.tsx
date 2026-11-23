import { useEffect, useState } from "react";
import { SiteFooter, SiteHeader } from "../components/Layout.tsx";
import { Plate } from "../components/Plate.tsx";
import { SummersChart } from "../components/SummersChart.tsx";
import { VisitsChart } from "../components/VisitsChart.tsx";
import { WeekendChart } from "../components/WeekendChart.tsx";
import { YearGridChart } from "../components/YearGridChart.tsx";
import { weekendLayout, yearLayout } from "../time.ts";
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

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function Home() {
  const today = useToday();
  const layout = yearLayout(today);
  const weekends = weekendLayout(layout);
  const { year } = layout;

  return (
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
        <Plate title="The year, in days" meta={`${layout.days.length} days`}>
          <YearGridChart year={year} layout={layout} />
        </Plate>
        <WeekendChart year={year} weekends={weekends} />
        <SummersChart />
        <VisitsChart />
      </main>
      <SiteFooter />
    </div>
  );
}
