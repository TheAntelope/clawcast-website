import type { Metadata } from "next";
import Link from "next/link";
import { DailyEpisode } from "../_components/DailyEpisode";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { APP_STORE_URL, PLANS } from "@/lib/site-config";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ClawCast for listeners — the podcast that reads your feed to you",
  description:
    "ClawCast for iOS turns the writers, newsletters, and topics you already follow into a short podcast in Apple Podcasts. Live on the App Store, free to try.",
  openGraph: {
    title: "ClawCast for listeners",
    description:
      "The writers and newsletters you already follow, delivered as a short podcast. Live on iOS, free to try.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawCast for listeners",
    description:
      "The writers and newsletters you already follow, delivered as a short podcast. Live on iOS, free to try.",
  },
};

export default function Listeners() {
  return (
    <div className={shell.page}>
      <SiteHeader active="listeners" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>For listeners · Live on iOS</div>
            <h1 className={shell.heroHeadline}>
              The reading list you never get to, finally finished — on your commute.
            </h1>
            <p className={shell.heroSub}>
              ClawCast is a tiny iOS app that turns the writers, newsletters, and topics you
              already follow into a short, well-edited podcast. Subscribe once in Apple
              Podcasts. Fresh episodes show up on the days you pick, in your timezone.
            </p>
            <div className={shell.heroActions}>
              <a
                className={styles.appStoreBadge}
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download ClawCast on the App Store"
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                />
              </a>
              <a className={shell.btnSecondary} href="#today">
                Hear a sample
              </a>
            </div>
            <p className={styles.heroNote}>
              iPhone (iOS 17+) · Free to try · Plays in Apple Podcasts
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <DailyEpisode id="today" />

        <div className={shell.divider} />

        <section className={shell.section} id="what-you-get">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>What you get.</h2>
              <p className={shell.sectionLead}>
                ClawCast is for people who read a lot, save a lot of tabs, and wish they had a
                smart friend to walk them through it all on the way to work.
              </p>
            </div>

            <ul className={styles.featureGrid}>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>A feed that&rsquo;s actually yours</h3>
                <p className={styles.featureBody}>
                  Pick topics, paste RSS feeds, or forward newsletters to a private inbox
                  ClawCast gives you. Everything you subscribe to flows into one place.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Hosts you choose</h3>
                <p className={styles.featureBody}>
                  Pair an anchor with a commentator — calm and dry, warm and witty,
                  whatever fits. Swap them anytime. You&rsquo;re not stuck with one voice.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Five minutes, on purpose</h3>
                <p className={styles.featureBody}>
                  Episodes are short by design — headlines, the reporting underneath, and what
                  to read in full if you want to go deeper. Paid plans let you stretch an
                  episode up to 20 minutes when there&rsquo;s more to cover.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Plays in Apple Podcasts</h3>
                <p className={styles.featureBody}>
                  Your show is a private feed in Apple Podcasts — no new app to keep open.
                  Spotify, Overcast, and Pocket Casts are on the roadmap; tell us which one
                  to ship next.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Your schedule, your timezone</h3>
                <p className={styles.featureBody}>
                  Daily, weekdays, three times a week — pick what works. Episodes drop at the
                  time you want, finished and ready to play.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Try it before you pay</h3>
                <p className={styles.featureBody}>
                  Download it, wire up your sources, and generate a real episode for free
                  before deciding on a plan. No card to hear what it sounds like.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="pricing">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>What it costs.</h2>
              <p className={shell.sectionLead}>
                Start free and hear your first episode before you pay. Paid plans unlock the
                full source catalog, episodes up to 20 minutes, and delivery every day of the
                week.
              </p>
            </div>

            <div className={styles.planGrid}>
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={`${styles.plan} ${plan.featured ? styles.planFeatured : ""}`}
                >
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planAmount}>{plan.price}</span>
                    <span className={styles.planCadence}>{plan.cadence}</span>
                  </div>
                  <p className={styles.planBlurb}>{plan.blurb}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Who it&rsquo;s for.</h2>
              <p className={shell.sectionLead}>
                ClawCast suits some listening habits better than others. Here&rsquo;s the
                honest version, so you know before you download.
              </p>
            </div>

            <div className={styles.fitGrid}>
              <div className={styles.fit}>
                <h3 className={styles.fitTitle}>Good fit if&hellip;</h3>
                <ul className={styles.fitList}>
                  <li>You subscribe to more newsletters than you read.</li>
                  <li>You commute, walk, run, or do dishes a lot.</li>
                  <li>You have an iPhone and listen in Apple Podcasts.</li>
                  <li>You&rsquo;ll tell us when something sounds wrong.</li>
                </ul>
              </div>
              <div className={styles.fit}>
                <h3 className={styles.fitTitle}>Probably not yet if&hellip;</h3>
                <ul className={styles.fitList}>
                  <li>
                    You listen in Spotify, Overcast, or Pocket Casts — those are on the
                    roadmap.
                  </li>
                  <li>
                    You&rsquo;re on Android — it&rsquo;s in closed alpha; join the{" "}
                    <Link href="/#android">waitlist on the home page</Link>.
                  </li>
                  <li>You want fully human-hosted shows. Ours are AI hosts.</li>
                </ul>
              </div>
            </div>

            <div className={styles.ctaBlock}>
              <a
                className={styles.appStoreBadge}
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download ClawCast on the App Store"
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                />
              </a>
              <span className={styles.ctaNote}>Free to try. Plays in Apple Podcasts.</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
