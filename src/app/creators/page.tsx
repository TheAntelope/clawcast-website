import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "ClawCast for creators — turn your Substack into a podcast in your voice",
  description:
    "ClawCast for creators automatically turns your Substack posts into a podcast, narrated in your own voice. A new distribution channel for writers, with zero new work.",
  openGraph: {
    title: "ClawCast for creators",
    description:
      "Your posts, in your voice, on every podcast app — automatically. A new distribution channel for Substackers and bloggers.",
    type: "website",
  },
};

const pilotMailto =
  "mailto:hello@theclawcast.com?subject=ClawCast%20creator%20pilot&body=Hi%20—%20I%20write%20at%20[link]%20and%20I%27d%20like%20to%20be%20part%20of%20the%20ClawCast%20creator%20pilot.";

export default function Creators() {
  return (
    <div className={shell.page}>
      <SiteHeader active="creators" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>For creators · Pilot</div>
            <h1 className={shell.heroHeadline}>
              Your Substack, in your voice, on every podcast app.
            </h1>
            <p className={shell.heroSub}>
              Hit publish like you always do. ClawCast takes your post, narrates it in a
              voice clone of you, and ships it to Apple Podcasts, Spotify, and the rest —
              automatically. A second distribution channel that costs you zero extra effort.
            </p>
            <div className={shell.heroActions}>
              <a className={shell.btnPrimary} href={pilotMailto}>
                Join the creator pilot
              </a>
              <a className={shell.btnSecondary} href="#how-it-works">
                How it works
              </a>
            </div>
            <p className={styles.heroNote}>
              Substack, Ghost, RSS, or a Markdown export · Revenue share during pilot
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>The audience you&rsquo;re missing.</h2>
              <p className={shell.sectionLead}>
                Around 1 in 3 Americans listens to podcasts weekly. Most of them are not
                reading your newsletter on a phone screen at 11pm — they&rsquo;re driving,
                walking the dog, or doing the dishes. ClawCast meets them there.
              </p>
            </div>

            <div className={styles.statRow}>
              <div className={styles.stat}>
                <div className={styles.statValue}>0 min</div>
                <div className={styles.statLabel}>extra work per post</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>~24 hr</div>
                <div className={styles.statLabel}>from publish to podcast feed</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>1 voice</div>
                <div className={styles.statLabel}>cloned from a 10-minute sample</div>
              </div>
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section} id="how-it-works">
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>How it works.</h2>
              <p className={shell.sectionLead}>
                You don&rsquo;t change anything about how you write or publish. ClawCast sits
                downstream and handles the audio.
              </p>
            </div>

            <ol className={styles.flowList}>
              <li className={styles.flow}>
                <div className={styles.flowNumber}>1</div>
                <div>
                  <h3 className={styles.flowTitle}>Record a short voice sample, once</h3>
                  <p className={styles.flowBody}>
                    Ten minutes of you reading any text you like, on your phone, in a quiet
                    room. We build a private voice model from it.
                  </p>
                </div>
              </li>
              <li className={styles.flow}>
                <div className={styles.flowNumber}>2</div>
                <div>
                  <h3 className={styles.flowTitle}>Connect your feed</h3>
                  <p className={styles.flowBody}>
                    Point us at your Substack, Ghost, or RSS. Each time you publish,
                    ClawCast picks up the post — paid posts stay paid, only what you mark
                    public goes to audio.
                  </p>
                </div>
              </li>
              <li className={styles.flow}>
                <div className={styles.flowNumber}>3</div>
                <div>
                  <h3 className={styles.flowTitle}>We turn it into an episode</h3>
                  <p className={styles.flowBody}>
                    Pull-quotes, headings, and footnotes are handled. We render it in your
                    voice, add a clean intro and outro, and write the show notes from your
                    own copy.
                  </p>
                </div>
              </li>
              <li className={styles.flow}>
                <div className={styles.flowNumber}>4</div>
                <div>
                  <h3 className={styles.flowTitle}>You approve, we publish</h3>
                  <p className={styles.flowBody}>
                    Get a one-tap preview link by email. Approve it, or skip it. Approved
                    episodes ship to Apple Podcasts, Spotify, Overcast, and your own embedded
                    player.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>The fine print writers actually care about.</h2>
            </div>

            <dl className={styles.faq}>
              <div className={styles.faqItem}>
                <dt className={styles.faqQ}>Who owns the voice model?</dt>
                <dd className={styles.faqA}>
                  You do. It&rsquo;s private to your account, not used to train anything
                  shared, and you can wipe it any time with one click.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqQ}>What about paid posts?</dt>
                <dd className={styles.faqA}>
                  Paid posts can stay private, ship to a paid podcast feed for your paying
                  subscribers, or stay out of audio entirely. Your call, per post.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqQ}>Does it sound like a robot?</dt>
                <dd className={styles.faqA}>
                  No — that&rsquo;s the whole point. We&rsquo;ll send you sample episodes
                  from current pilot writers when you apply. Judge for yourself.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqQ}>How does pricing work?</dt>
                <dd className={styles.faqA}>
                  During the pilot it&rsquo;s a revenue share on the audio channel only:
                  ads we sell, premium subscribers we bring in. You keep 100% of your
                  existing newsletter revenue. Always.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqQ}>Can I leave?</dt>
                <dd className={styles.faqA}>
                  Anytime. Your podcast feed, episodes, and listener emails go with you.
                  No lock-in.
                </dd>
              </div>
            </dl>

            <div className={styles.ctaBlock}>
              <a className={shell.btnPrimary} href={pilotMailto}>
                Join the creator pilot
              </a>
              <span className={styles.ctaNote}>Send a link to your newsletter — that&rsquo;s all we need.</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
