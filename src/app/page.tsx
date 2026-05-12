import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import shell from "./_styles/shell.module.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={shell.page}>
      <SiteHeader active="home" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>Your daily briefing, made for you</div>
            <h1 className={shell.heroHeadline}>
              Your own podcast, made from the news you actually follow.
            </h1>
            <p className={shell.heroSub}>
              Pick the topics and writers you care about. ClawCast turns them into a short
              podcast, hosted by AI voices, and lands a fresh episode in Apple Podcasts on
              the days you choose.
            </p>
            <div className={shell.heroActions}>
              <a
                className={shell.btnPrimary}
                href="mailto:hello@theclawcast.com?subject=Join%20the%20ClawCast%20beta"
              >
                Join the beta
              </a>
              <a className={shell.btnSecondary} href="#how">
                See how it works
              </a>
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="how">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Three steps to your show.</h2>
              <p className={shell.sectionLead}>
                Setup takes a couple of minutes. After that you don&rsquo;t need to open the
                app — episodes show up wherever you already listen.
              </p>
            </div>

            <div className={styles.steps}>
              <article className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3 className={styles.stepTitle}>Choose your sources</h3>
                <p className={styles.stepBody}>
                  Pick from curated topic bundles or paste in your own RSS feeds. After
                  setup, you also get an email address for subscribing to newsletters that
                  flow straight into your podcast.
                </p>
              </article>

              <article className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3 className={styles.stepTitle}>Pick the hosts</h3>
                <p className={styles.stepBody}>
                  Choose one or two AI voices to read and riff on the day&rsquo;s items.
                  Anchor leads each segment, commentator chimes in. Change either anytime.
                </p>
              </article>

              <article className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3 className={styles.stepTitle}>Listen in Apple Podcasts</h3>
                <p className={styles.stepBody}>
                  A five-minute episode lands in a private feed on the days you choose, in
                  your timezone. Apple Podcasts only for now — other players are on the
                  roadmap.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
