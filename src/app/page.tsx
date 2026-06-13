import Link from "next/link";
import { DailyEpisode } from "./_components/DailyEpisode";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import {
  ANDROID_WAITLIST_FORM_URL,
  APP_STORE_URL,
  FREE_TRIAL_LIVE,
  PLANS,
} from "@/lib/site-config";
import shell from "./_styles/shell.module.css";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={shell.page}>
      <SiteHeader active="home" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>Live on iOS</div>
            <h1 className={shell.heroHeadline}>
              Your unread newsletters, turned into your own morning show.
            </h1>
            <p className={shell.heroSub}>
              Pick the topics and writers you care about. ClawCast turns them into a short
              podcast, hosted by AI voices, and lands a fresh episode in Apple Podcasts on
              the days you choose. Free to try before you pay.
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
                Hear today&rsquo;s episode
              </a>
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <DailyEpisode id="today" />

        <div className={shell.divider} />

        <section className={shell.section} id="how">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Three steps to your show.</h2>
              <p className={shell.sectionLead}>
                Setup takes a couple of minutes. After that you don&rsquo;t need to open
                ClawCast again — finished episodes show up in Apple Podcasts on their own.
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
                  your timezone. Apple Podcasts only for now — other players are on{" "}
                  <Link href="/roadmap">the roadmap</Link>.
                </p>
              </article>
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="pricing">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Start free. Pay when it sticks.</h2>
              <p className={shell.sectionLead}>
                Make your first episode and hear it before you decide. Paid plans unlock the
                full source catalog, episodes up to 20 minutes, and delivery every day of the
                week.
              </p>
              {FREE_TRIAL_LIVE && (
                <p className={shell.sectionLead}>
                  Every new listener starts with a <strong>7-day free trial</strong> of full
                  Max access — every premium voice, longer episodes, and daily delivery. No
                  card required.
                </p>
              )}
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

            <div className={styles.pricingCta}>
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
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="android">
          <div className={`${shell.container} ${styles.androidStrip}`}>
            <div>
              <h2 className={styles.androidTitle}>On Android?</h2>
              <p className={styles.androidBody}>
                ClawCast is in closed alpha on Android. Join the waitlist and we&rsquo;ll let
                you in as spots open.
              </p>
            </div>
            {ANDROID_WAITLIST_FORM_URL ? (
              <a
                className={shell.btnPrimary}
                href={ANDROID_WAITLIST_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the Android waitlist
              </a>
            ) : (
              // TODO: set ANDROID_WAITLIST_FORM_URL in site-config.ts to enable this CTA.
              <span className={styles.androidPending}>Waitlist opening soon</span>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
