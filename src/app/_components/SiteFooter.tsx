import Link from "next/link";
import styles from "./site-chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerInner}`}>
        <span>&copy; {new Date().getFullYear()} ClawCast</span>
        <nav className={styles.footerLinks} aria-label="Footer">
          <Link href="/listeners">For listeners</Link>
          <Link href="/creators">For creators</Link>
          <Link href="/about">About</Link>
          <a href="mailto:hello@theclawcast.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
