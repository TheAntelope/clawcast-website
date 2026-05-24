import Link from "next/link";
import { redirect } from "next/navigation";
import { SPOTIFY_SHOW_URL } from "@/lib/clawcast";
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
          ClawCast polls your feed once a day. Each new post renders into a
          five-minute episode in your voice and lands in our public RSS feed,
          which the shared ClawCast Spotify show pulls from automatically.
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
              {state.voice.kind === "premium" ? (
                <span className={styles.summaryValueMuted}>
                  Premium ElevenLabs voice — no clone, just a preset ID.
                </span>
              ) : null}
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
            A cron job polls your feed daily and renders new posts in{" "}
            {state.voice.kind === "premium"
              ? "your selected voice"
              : "your cloned voice"}
            .
          </li>
          <li>
            Episodes append to our public feed at{" "}
            <Link href="/podcast.xml" target="_blank">
              /podcast.xml
            </Link>
            .
          </li>
          <li>
            The shared ClawCast Spotify show pulls from that feed —{" "}
            <a href={SPOTIFY_SHOW_URL} target="_blank" rel="noreferrer">
              listen here
            </a>
            . Spotify usually picks up new episodes within a few hours of its
            next pull.
          </li>
        </ul>
        <div className={styles.actions}>
          <a
            href={SPOTIFY_SHOW_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.btnPrimary}
          >
            Open ClawCast on Spotify
          </a>
          <Link href="/" className={styles.btnSecondary}>
            Back to ClawCast
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
