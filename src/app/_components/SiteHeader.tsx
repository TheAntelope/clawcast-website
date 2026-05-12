import Link from "next/link";
import styles from "./site-chrome.module.css";

type NavLink = { href: string; label: string };

const navLinks: NavLink[] = [
  { href: "/listeners", label: "For listeners" },
  { href: "/creators", label: "For creators" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ active }: { active?: "home" | "listeners" | "creators" | "about" }) {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label="ClawCast home">
          ClawCast
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => {
            const key = link.href.replace("/", "") as "listeners" | "creators" | "about";
            const isActive = active === key;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
