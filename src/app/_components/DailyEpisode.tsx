import {
  getLatestDailyEpisode,
  DAILY_SHOW_SOURCES,
  DAILY_SHOW_SUBSCRIBE_LINKS,
} from "@/lib/daily-show";
import { X_ACCOUNT_URL } from "@/lib/site-config";
import shell from "../_styles/shell.module.css";
import styles from "./daily-episode.module.css";

// The "Today's episode" module. Server component: it fetches the latest daily
// show episode at render time and plays it inline. If the feed is unset or
// unreachable, the section still renders (so anchor links stay valid) but the
// player degrades to a follow-on-X prompt instead of a broken control.
export async function DailyEpisode({ id }: { id?: string }) {
  const episode = await getLatestDailyEpisode();

  const sources = DAILY_SHOW_SOURCES.trim();
  const intro = sources
    ? `ClawCast generates this short show every morning from ${sources} — the same way it would from your newsletters.`
    : "ClawCast generates this short show every morning — the same way it would from the newsletters and feeds you follow.";

  return (
    <section className={shell.section} id={id}>
      <div className={shell.container}>
        <div className={shell.sectionHeader}>
          <div className={shell.eyebrow}>Today&rsquo;s episode</div>
          <h2 className={shell.sectionHeadline}>Hear what ClawCast sounds like.</h2>
          <p className={shell.sectionLead}>{intro}</p>
        </div>

        <div className={styles.player}>
          {episode ? (
            <>
              <h3 className={styles.episodeTitle}>{episode.title}</h3>
              {episode.pubDate && (
                <p className={styles.episodeDate}>{formatDate(episode.pubDate)}</p>
              )}
              {/* Native audio — no player library. */}
              <audio
                className={styles.audio}
                controls
                preload="none"
                src={episode.audioUrl}
              >
                Your browser doesn&rsquo;t support audio playback.{" "}
                <a href={episode.audioUrl}>Download the episode</a>.
              </audio>
            </>
          ) : (
            <p className={styles.fallback}>
              Today&rsquo;s episode is on its way. Follow along on X to catch each
              one as it drops.
            </p>
          )}
        </div>

        <div className={styles.followRow}>
          <a
            className={styles.followLink}
            href={X_ACCOUNT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow along daily on X
          </a>
          {DAILY_SHOW_SUBSCRIBE_LINKS.map((link) => (
            <a
              key={link.href}
              className={styles.followLink}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
