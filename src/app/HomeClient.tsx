"use client";

import dynamic from "next/dynamic";
import { SiteHeader } from "../components/Layout.tsx";
import styles from "../components/Home.module.css";

const Home = dynamic(
  () => import("../components/Home.tsx").then((mod) => mod.Home),
  {
    ssr: false,
    loading: () => (
      <div className={styles.page}>
        <SiteHeader />
        <main className={styles.main} />
      </div>
    ),
  },
);

export function HomeClient() {
  return <Home />;
}
