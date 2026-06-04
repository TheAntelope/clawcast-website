import Link from "next/link";
import styles from "./site-chrome.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerBacked}>
          <span>Backed by</span>
          <a
            href="https://elevenlabs.io/startup-grants"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ElevenLabs Grants"
          >
            <img
              src="/elevenlabs-grants.webp"
              alt="ElevenLabs Grants"
              width={200}
              height={18}
            />
          </a>
        </div>
        <div className={styles.footerInner}>
          <span>&copy; {new Date().getFullYear()} ClawCast</span>
          <nav className={styles.footerLinks} aria-label="Footer">
            <Link href="/listeners">For listeners</Link>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/delete-account">Delete account</Link>
            <a href="mailto:Vince@theclawcast.com">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
