import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SUPPORT_URL } from "../content/donations.ts";
import styles from "./Layout.module.css";

export function SiteHeader({ meta }: { meta?: ReactNode }) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        Perspective
      </Link>
      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>Saved in this browser only.</p>
      <div className={styles.footerMeta}>
        <p>
          Created with ♥ by{" "}
          <a
            href="https://x.com/stavrosnonis"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stavros
          </a>
        </p>
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          Support
        </a>
      </div>
    </footer>
  );
}
