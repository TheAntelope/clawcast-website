import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <span className={styles.brand}>ClawCast</span>
          <a href="#how" className={styles.navLink}>
            How it works
          </a>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.eyebrow}>Your daily briefing, made for you</div>
            <h1 className={styles.heroHeadline}>
              Your own podcast, made from the news you actually follow.
            </h1>
            <p className={styles.heroSub}>
              Pick the topics and writers you care about. ClawCast turns them into a short
              podcast, hosted by AI voices, and lands a fresh episode in Apple Podcasts on
              the days you choose.
            </p>
            <div className={styles.heroActions}>
              <a
                className={styles.btnPrimary}
                href="mailto:hello@theclawcast.com?subject=Join%20the%20ClawCast%20beta"
              >
                Join the beta
              </a>
              <a className={styles.btnSecondary} href="#how">
                See how it works
              </a>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.section} id="how">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeadline}>Three steps to your show.</h2>
              <p className={styles.sectionLead}>
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
                  A private feed lands on the days you choose, at the time you choose, in
                  your timezone. No new app to open — just listen.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <span>&copy; {new Date().getFullYear()} ClawCast</span>
          <nav className={styles.footerLinks}>
            <a href="mailto:hello@theclawcast.com">Contact</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
