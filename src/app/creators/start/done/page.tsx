import Link from "next/link";
import { redirect } from "next/navigation";
import { readCreatorState } from "@/lib/creator-state";
import { resetWizard } from "../actions";
import { Stepper } from "../Stepper";
import styles from "../wizard.module.css";

const CHANNEL_LABELS: Record<string, string> = {
  "spotify-shared": "Spotify (shared ClawCast pilot show)",
  "apple-podcasts": "Apple Podcasts",
  "spotify-own": "Your own Spotify show",
  rss: "Standalone RSS feed",
};

export default async function DonePage() {
  const state = await readCreatorState();
  if (!state?.voice) redirect("/creators/start/voice");
  if (!state.substack) redirect("/creators/start/feed");
  if (!state.channels?.length) redirect("/creators/start/channels");

  return (
    <>
      <header>
        <div className={styles.eyebrow}>You&rsquo;re set</div>
        <h1 className={styles.heading}>
          {state.substack.title ?? "Your newsletter"} is in the queue.
        </h1>
        <p className={styles.lead}>
          ClawCast will check your feed within the hour. The first new post
          renders into a five-minute episode in your voice and lands in the
          ClawCast Spotify show — we&rsquo;ll email a preview link before it
          goes public.
        </p>
      </header>

      <Stepper
        active="done"
        completed={new Set(["voice", "feed", "channels", "done"])}
      />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>What we&rsquo;ve got on file</h2>
        <dl className={styles.summary}>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Voice</dt>
            <dd className={styles.summaryValue}>
              <span>{state.voice.name}</span>
              <span className={styles.code}>{state.voice.id}</span>
              {state.voice.mock ? (
                <span className={styles.summaryValueMuted}>
                  Placeholder ID — re-run with <code>ELEVENLABS_API_KEY</code>{" "}
                  set to clone for real.
                </span>
              ) : null}
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Newsletter</dt>
            <dd className={styles.summaryValue}>
              <span>{state.substack.title ?? state.substack.url}</span>
              <span className={styles.code}>{state.substack.feed}</span>
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryLabel}>Channels</dt>
            <dd className={styles.summaryValue}>
              {state.channels.map((id) => (
                <span key={id}>{CHANNEL_LABELS[id] ?? id}</span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>What happens next</h2>
        <ul className={styles.cardBody} style={{ paddingLeft: 18 }}>
          <li>
            We poll your feed every couple of hours and queue new public posts
            for narration.
          </li>
          <li>
            Each episode renders in your cloned voice with a clean intro and
            outro and ships to the shared Spotify show.
          </li>
          <li>
            You&rsquo;ll get a preview email before the first episode goes
            live — reply with edits or a thumbs up.
          </li>
        </ul>
        <div className={styles.actions}>
          <Link href="/creators" className={styles.btnSecondary}>
            Back to creators page
          </Link>
          <form action={resetWizard}>
            <button type="submit" className={styles.btnGhost}>
              Start over
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
