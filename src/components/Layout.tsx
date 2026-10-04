import { Link } from "react-router-dom";
import styles from "./Layout.module.css";

export function SiteHeader() {
  return (
    <header className={`${styles.header} ${styles.dark} no-print`}>
      <Link to="/" className={styles.brand}>
        Perspective
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>Nothing you type is saved.</p>
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
      </div>
    </footer>
  );
}
