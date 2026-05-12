import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ClawCast for listeners — the podcast that reads your feed to you",
  description:
    "ClawCast for iOS turns the writers, newsletters, and topics you already follow into a short daily podcast in Apple Podcasts. Now in private beta.",
  openGraph: {
    title: "ClawCast for listeners",
    description:
      "The writers and newsletters you already follow, delivered as a short daily podcast. Now in private beta on iOS.",
    type: "website",
  },
};

const betaMailto =
  "mailto:hello@theclawcast.com?subject=ClawCast%20iOS%20beta%20tester&body=Hi%20—%20I%27d%20like%20to%20join%20the%20ClawCast%20listener%20beta.";

export default function Listeners() {
  return (
    <div className={shell.page}>
      <SiteHeader active="listeners" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>For listeners · iOS beta</div>
            <h1 className={shell.heroHeadline}>
              The reading list you never get to, finally finished — on your commute.
            </h1>
            <p className={shell.heroSub}>
              ClawCast is a tiny iOS app that turns the writers, newsletters, and topics you
              already follow into a short, well-edited podcast. Subscribe once in Apple
              Podcasts. Fresh episodes show up on the days you pick, in your timezone.
            </p>
            <div className={shell.heroActions}>
              <a className={shell.btnPrimary} href={betaMailto}>
                Apply for the beta
              </a>
              <a className={shell.btnSecondary} href="#what-you-get">
                What you get
              </a>
            </div>
            <p className={styles.heroNote}>
              Private TestFlight · iPhone (iOS 17+) · Free during beta
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="what-you-get">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>What you get as a beta listener.</h2>
              <p className={shell.sectionLead}>
                We&rsquo;re looking for people who read a lot, save a lot of tabs, and wish
                they had a smart friend to walk them through it all on the way to work.
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
                <h3 className={styles.featureTitle}>Short by default</h3>
                <p className={styles.featureBody}>
                  Most episodes are 8–15 minutes. Headlines, the actual reporting underneath,
                  and what to read in full if you want to go deeper. No 90-minute marathons.
                </p>
              </li>
              <li className={styles.feature}>
                <h3 className={styles.featureTitle}>Plays where you already listen</h3>
                <p className={styles.featureBody}>
                  Your show is a private podcast feed. Apple Podcasts, Overcast, Pocket
                  Casts, anything that takes a URL. No new app to keep open.
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
                <h3 className={styles.featureTitle}>Direct line to the team</h3>
                <p className={styles.featureBody}>
                  Beta testers get a Slack channel and an email that actually gets read. Tell
                  us what&rsquo;s wrong, and there&rsquo;s a good chance you&rsquo;ll see it
                  fixed the same week.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Who we&rsquo;re looking for.</h2>
              <p className={shell.sectionLead}>
                The beta is small on purpose. We&rsquo;re prioritising people who&rsquo;ll
                actually use it daily and give us blunt feedback.
              </p>
            </div>

            <div className={styles.fitGrid}>
              <div className={styles.fit}>
                <h3 className={styles.fitTitle}>Good fit if&hellip;</h3>
                <ul className={styles.fitList}>
                  <li>You subscribe to more newsletters than you read.</li>
                  <li>You commute, walk, run, or do dishes a lot.</li>
                  <li>You have an iPhone and use Apple Podcasts or a podcast player.</li>
                  <li>You&rsquo;ll tell us when something sounds wrong.</li>
                </ul>
              </div>
              <div className={styles.fit}>
                <h3 className={styles.fitTitle}>Probably not yet if&hellip;</h3>
                <ul className={styles.fitList}>
                  <li>You need an Android app — that&rsquo;s coming later.</li>
                  <li>You only listen on desktop or a smart speaker.</li>
                  <li>You want fully human-hosted shows. Ours are AI hosts.</li>
                </ul>
              </div>
            </div>

            <div className={styles.ctaBlock}>
              <a className={shell.btnPrimary} href={betaMailto}>
                Apply for the beta
              </a>
              <span className={styles.ctaNote}>Two-line reply about your reading habits is plenty.</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
