import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About ClawCast",
  description:
    "ClawCast is building two sides of the same idea: a podcast made from the news you follow, and a way for writers to publish in their own voice.",
  openGraph: {
    title: "About ClawCast",
    description:
      "Two sides of the same idea: a podcast made from the news you follow, and a way for writers to publish in their own voice.",
    type: "website",
  },
};

export default function About() {
  return (
    <div className={shell.page}>
      <SiteHeader active="about" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>About</div>
            <h1 className={shell.heroHeadline}>
              Reading is hard to fit in. Listening isn&rsquo;t.
            </h1>
            <p className={shell.heroSub}>
              ClawCast started as a small frustration: a long list of writers and
              newsletters we cared about, and a tiny number of hours each week to actually
              read them. We built the thing we wanted — a private podcast made from the
              writing we&rsquo;d already chosen to follow.
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Two products, one idea.</h2>
              <p className={shell.sectionLead}>
                We&rsquo;re building ClawCast as two sides of the same problem: getting good
                writing into ears that have time for it.
              </p>
            </div>

            <div className={styles.pillarGrid}>
              <article className={styles.pillar}>
                <div className={styles.pillarTag}>For listeners</div>
                <h3 className={styles.pillarTitle}>The reading list, narrated.</h3>
                <p className={styles.pillarBody}>
                  An iOS app that turns the writers, newsletters, and topics you already
                  follow into a short daily podcast, hosted by AI voices and delivered to
                  Apple Podcasts on your schedule.
                </p>
              </article>
              <article className={styles.pillar}>
                <div className={styles.pillarTag}>For creators</div>
                <h3 className={styles.pillarTitle}>Your posts, in your voice.</h3>
                <p className={styles.pillarBody}>
                  A platform for Substackers and bloggers that automatically turns every new
                  post into a podcast episode narrated in a clone of the writer&rsquo;s own
                  voice. A second distribution channel, no extra work.
                </p>
              </article>
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>What we believe.</h2>
            </div>

            <ul className={styles.beliefs}>
              <li className={styles.belief}>
                <h3 className={styles.beliefTitle}>Attention follows format.</h3>
                <p className={styles.beliefBody}>
                  The best writing in the world is wasted if it never gets read. Audio meets
                  people where they already have free hands and free ears.
                </p>
              </li>
              <li className={styles.belief}>
                <h3 className={styles.beliefTitle}>Writers should own their distribution.</h3>
                <p className={styles.beliefBody}>
                  Voice clones, podcast feeds, listener emails — they all belong to the
                  writer, not the platform. If you want to leave, you take it with you.
                </p>
              </li>
              <li className={styles.belief}>
                <h3 className={styles.beliefTitle}>AI hosts, human curation.</h3>
                <p className={styles.beliefBody}>
                  The hosts are synthetic so the show can be made for one listener. The
                  source material is human, picked by the listener or the writer. We&rsquo;re
                  not in the business of generating opinions — we&rsquo;re in the business of
                  reading the ones you chose, out loud.
                </p>
              </li>
              <li className={styles.belief}>
                <h3 className={styles.beliefTitle}>Short is a feature.</h3>
                <p className={styles.beliefBody}>
                  Most episodes should be under 15 minutes. We measure success in episodes
                  finished, not minutes streamed.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>Get in touch.</h2>
              <p className={shell.sectionLead}>
                We&rsquo;re a small team, easy to reach, and genuinely curious about what
                you&rsquo;re trying to listen to or publish.
              </p>
            </div>

            <div className={styles.contactRow}>
              <a className={shell.btnPrimary} href="mailto:hello@theclawcast.com">
                hello@theclawcast.com
              </a>
              <span className={styles.contactNote}>
                Pitches, press, partnerships, or just hello — same inbox.
              </span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
