import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Roadmap — ClawCast",
  description:
    "What ClawCast is shipping in the next three weeks, day by day. TestFlight, a hardened backend, and a swipe-based recommender.",
  openGraph: {
    title: "ClawCast roadmap",
    description:
      "What ClawCast is shipping in the next three weeks, day by day.",
    type: "website",
  },
};

type Milestone = { days: string; title: string; body: string };
type Week = {
  label: string;
  range: string;
  theme: string;
  lead: string;
  milestones: Milestone[];
};

const weeks: Week[] = [
  {
    label: "Week 1",
    range: "Days 1–7",
    theme: "Get on TestFlight.",
    lead: "Internal testers in Apple's TestFlight by the end of the week.",
    milestones: [
      {
        days: "Day 1",
        title: "App Store Connect record",
        body: "Apple Developer account confirmed; app record created for com.newsletterpod.app.",
      },
      {
        days: "Day 2",
        title: "Sign in with Apple + StoreKit",
        body: "Enable Sign in with Apple for the bundle ID; create the monthly and annual subscription products.",
      },
      {
        days: "Day 3–4",
        title: "Codemagic wired up",
        body: "GitHub connected, App Store Connect API key integration added, iOS code signing enabled.",
      },
      {
        days: "Day 5",
        title: "Backend pointer + auth secrets",
        body: "AppConfiguration.swift pointed at the deployed Cloud Run; APPLE_CLIENT_ID and SESSION_SIGNING_SECRET confirmed.",
      },
      {
        days: "Day 6–7",
        title: "First TestFlight build",
        body: "Run the ios-testflight workflow, invite internal testers, watch what breaks.",
      },
    ],
  },
  {
    label: "Week 2",
    range: "Days 8–14",
    theme: "Harden the backend.",
    lead: "Real verification, real scheduling, one full end-to-end run with a real user.",
    milestones: [
      {
        days: "Day 8–9",
        title: "Apple token verification",
        body: "Replace the placeholder path with real identity-token verification on POST /v1/auth/apple.",
      },
      {
        days: "Day 10–11",
        title: "App Store notification signing",
        body: "Signed-payload verification for POST /v1/billing/app-store/notifications.",
      },
      {
        days: "Day 12",
        title: "Dispatcher on Cloud Scheduler",
        body: "Call /jobs/dispatch-due-users every 15 minutes; evaluate Cloud Tasks for per-user enqueuing.",
      },
      {
        days: "Day 13–14",
        title: "End-to-end with one real user",
        body: "Sign in, configure sources and format, schedule, generate, subscribe in Apple Podcasts, hear it play.",
      },
    ],
  },
  {
    label: "Week 3",
    range: "Days 15–21",
    theme: "Make it tunable.",
    lead: "Swipe-based interest replaces topic groupings as the relevance signal.",
    milestones: [
      {
        days: "Day 15–16",
        title: "Persistent source items",
        body: "New source_items Firestore collection; embed title + summary with OpenAI text-embedding-3-small at ingest.",
      },
      {
        days: "Day 17",
        title: "Swipes + interest vector",
        body: "Swipe collection in Firestore; user vector as right-mean minus left-mean, L2-normalized, cached per generation run.",
      },
      {
        days: "Day 18",
        title: "Ranker behind a flag",
        body: "Score candidates by cosine similarity before script generation; topics-based selection stays default until the flip.",
      },
      {
        days: "Day 19",
        title: "Cold-start k-means deck",
        body: "GET /v1/swipe-deck/cold-start returns ~15–20 cluster-center items; weekly refresh via Cloud Scheduler.",
      },
      {
        days: "Day 20–21",
        title: "iOS swipe onboarding",
        body: "Card-stack onboarding replaces the topics picker; a post-episode 'tune your pod' deck keeps the signal fresh.",
      },
    ],
  },
];

const scrubber = [
  { label: "Today", sub: "Kickoff" },
  { label: "Day 7", sub: "TestFlight live" },
  { label: "Day 14", sub: "Backend hardened" },
  { label: "Day 21", sub: "Tunable beta" },
];

const beyond = [
  "Per-pod output language on PodcastProfileRecord, with the voice catalog filtered by language affinity.",
  "Source-language detection at ingest, and a decision on implicit-LLM vs explicit translation.",
  "iOS UI localization: extract Screens.swift copy into Localizable.strings.",
  "Welcome-episode MP3s per language — or skip the welcome seed for non-English users.",
];

export default function Roadmap() {
  return (
    <div className={shell.page}>
      <SiteHeader active="roadmap" />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>Roadmap</div>
            <h1 className={shell.heroHeadline}>
              The next three weeks of ClawCast.
            </h1>
            <p className={shell.heroSub}>
              We plan in days and weeks, not quarters. Here&rsquo;s what
              we&rsquo;re shipping between now and three weeks out — TestFlight,
              a harder backend, and a recommender you teach with swipes.
            </p>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <ol
              className={styles.scrubber}
              aria-label="Three-week overview"
            >
              {scrubber.map((step, idx) => (
                <li
                  key={step.label}
                  className={`${styles.scrubberStep} ${
                    idx === 0 ? styles.scrubberStepNow : ""
                  }`}
                >
                  <span className={styles.scrubberDot} aria-hidden="true" />
                  <span className={styles.scrubberLabel}>{step.label}</span>
                  <span className={styles.scrubberSub}>{step.sub}</span>
                </li>
              ))}
            </ol>

            <div className={styles.weekGrid}>
              {weeks.map((week, idx) => (
                <article key={week.label} className={styles.week}>
                  <header className={styles.weekHeader}>
                    <span className={styles.weekNumber}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className={styles.weekMeta}>
                      <span className={styles.weekLabel}>{week.label}</span>
                      <span className={styles.weekRange}>{week.range}</span>
                    </div>
                  </header>
                  <h2 className={styles.weekTheme}>{week.theme}</h2>
                  <p className={styles.weekLead}>{week.lead}</p>

                  <ol className={styles.track}>
                    {week.milestones.map((m) => (
                      <li key={m.title} className={styles.milestone}>
                        <span className={styles.milestoneDays}>{m.days}</span>
                        <h3 className={styles.milestoneTitle}>{m.title}</h3>
                        <p className={styles.milestoneText}>{m.body}</p>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={shell.sectionHeader}>
              <h2 className={shell.sectionHeadline}>After day 21.</h2>
              <p className={shell.sectionLead}>
                The next big workstream is multi-language. Big enough that it
                doesn&rsquo;t fit a three-week window — it touches script
                generation, voice selection, RSS metadata, the iOS UI, and the
                welcome episode all at once.
              </p>
            </div>
            <ul className={styles.beyond}>
              {beyond.map((item) => (
                <li key={item} className={styles.beyondItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
