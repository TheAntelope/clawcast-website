import type { Metadata } from "next";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import shell from "../../_styles/shell.module.css";
import styles from "./wizard.module.css";

export const metadata: Metadata = {
  title: "Set up your ClawCast creator account",
  description:
    "Clone your voice, connect your Substack, and pick where ClawCast publishes your podcast.",
  robots: { index: false, follow: false },
};

export default function CreatorStartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={shell.page}>
      <SiteHeader active="creators" />
      <main className={styles.wizard}>
        <div className={shell.container}>
          <div className={styles.shellInner}>{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
