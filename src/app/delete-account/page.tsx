import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Delete your ClawCast account and data",
  description:
    "How to permanently delete your ClawCast account and all associated data. Deletion is immediate, irreversible, and removes everything.",
  openGraph: {
    title: "Delete your ClawCast account and data",
    description:
      "How to permanently delete your ClawCast account and all associated data. Deletion is immediate, irreversible, and removes everything.",
    type: "website",
  },
};

export default function DeleteAccount() {
  return (
    <div className={shell.page}>
      <SiteHeader />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>Account</div>
            <h1 className={shell.heroHeadline}>
              Delete your ClawCast account and data.
            </h1>
            <p className={shell.heroSub}>
              Deleting your account is <strong>immediate and irreversible</strong>.
              There&rsquo;s no separate &ldquo;data-only&rdquo; deletion: account
              deletion and data deletion are the same action. One delete removes
              everything we hold about you.
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={styles.prose}>
              <div className={styles.tldr}>
                <h2>What gets deleted</h2>
                <p>
                  When you delete your account, we permanently wipe your:
                </p>
                <ul>
                  <li>Profile</li>
                  <li>Preferences</li>
                  <li>Sources</li>
                  <li>Episodes</li>
                  <li>Audio files</li>
                  <li>Swipe history</li>
                  <li>Forwarded newsletters</li>
                  <li>Feedback</li>
                  <li>Device tokens</li>
                </ul>
              </div>

              <h2>Delete from inside the app</h2>
              <p>
                The fastest way to delete your account is directly in the
                ClawCast app:
              </p>
              <ol className={styles.steps}>
                <li>Open the ClawCast app.</li>
                <li>
                  Go to <strong>Settings</strong>.
                </li>
                <li>
                  Tap <strong>Delete account</strong>.
                </li>
              </ol>
              <p>
                Your account and all of the data listed above are removed
                immediately. This cannot be undone.
              </p>

              <h2>Can&rsquo;t access the app?</h2>
              <p>
                If you can&rsquo;t open the app, email{" "}
                <a href="mailto:Vince@theclawcast.com">
                  Vince@theclawcast.com
                </a>{" "}
                from the email address on your account and ask us to delete it.
                Sending the request from your account email lets us verify it&rsquo;s
                really you before we wipe everything.
              </p>

              <h2>The one retention exception</h2>
              <p>
                When you delete your account, we remove your personal data from
                our database and audio storage. The only exception is billing
                records we&rsquo;re legally required to keep under Danish
                bookkeeping rules &mdash; roughly five years. Those records stay
                in a limited-access archive until that retention period ends,
                after which they are also deleted.
              </p>

              <h2>More detail</h2>
              <p>
                For the full picture of what we collect, how we use it, and your
                rights, see our{" "}
                <a href="/privacy">privacy policy</a>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
