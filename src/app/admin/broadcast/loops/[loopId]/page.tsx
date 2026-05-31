import Link from "next/link";
import { notFound } from "next/navigation";

import {
  NewsletterPodConfigError,
  getLoop,
  listLoopEpisodes,
  type BroadcastEpisode,
  type BroadcastLoop,
} from "@/lib/newsletter-pod";
import {
  deleteLoopAction,
  pasteFeedbackAction,
  runLoopAction,
  upsertLoopAction,
} from "../../actions";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ loopId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LoopDetailPage({ params, searchParams }: Props) {
  const { loopId } = await params;
  const search = await searchParams;
  const runError = firstParam(search.run_error);
  const runSuccess = firstParam(search.run_success);
  const runSkipped = firstParam(search.run_skipped);
  const feedbackError = firstParam(search.feedback_error);
  const feedbackSuccess = firstParam(search.feedback_success);

  let loop: BroadcastLoop | null = null;
  let episodes: BroadcastEpisode[] = [];
  let configError: string | null = null;
  try {
    loop = await getLoop(loopId);
    if (loop) {
      episodes = await listLoopEpisodes(loopId, 25);
    }
  } catch (err) {
    if (err instanceof NewsletterPodConfigError) {
      configError =
        "NEWSLETTER_POD_URL and NEWSLETTER_POD_JOB_TRIGGER_TOKEN must be configured in env.";
    } else {
      throw err;
    }
  }

  if (configError) {
    return (
      <div className={styles.page}>
        <div className={styles.notice}>{configError}</div>
      </div>
    );
  }

  if (!loop) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.crumbs}>
        <Link href="/admin/broadcast">← All loops</Link>
      </div>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          {loop.loop_id}{" "}
          <span className={loop.active ? styles.badgeActive : styles.badgeInactive}>
            {loop.active ? "Active" : "Paused"}
          </span>
        </h1>
        <div className={styles.headerActions}>
          <form action={runLoopAction}>
            <input type="hidden" name="loop_id" value={loop.loop_id} />
            <button className={styles.btnPrimary} type="submit">
              Run now
            </button>
          </form>
        </div>
      </header>

      {runError && (
        <div className={styles.flashError}>
          <strong>Run failed.</strong> {runError}
        </div>
      )}
      {runSuccess && runSuccess.startsWith("http") && (
        <div className={styles.flashSuccess}>
          <strong>Posted.</strong>{" "}
          <a href={runSuccess} target="_blank" rel="noopener noreferrer">
            View tweet ↗
          </a>
        </div>
      )}
      {runSuccess && !runSuccess.startsWith("http") && (
        <div className={styles.flashSuccess}>{runSuccess}</div>
      )}
      {runSkipped && (
        <div className={styles.flashNeutral}>
          <strong>Run skipped.</strong> {runSkipped}
        </div>
      )}
      {feedbackError && (
        <div className={styles.flashError}>
          <strong>Feedback save failed.</strong> {feedbackError}
        </div>
      )}
      {feedbackSuccess && (
        <div className={styles.flashSuccess}>{feedbackSuccess}</div>
      )}

      <section>
        <h2 className={styles.headerTitle} style={{ fontSize: 20, marginBottom: 12 }}>
          Loop config
        </h2>
        <form action={upsertLoopAction} className={styles.form}>
          <input type="hidden" name="loop_id" value={loop.loop_id} />

          <div className={styles.formRow}>
            <label htmlFor="region">Region label</label>
            <input id="region" name="region" type="text" required defaultValue={loop.region} />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="timezone">Timezone (IANA)</label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              required
              defaultValue={loop.timezone}
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="post_local_time">Post time (local 24h)</label>
            <input
              id="post_local_time"
              name="post_local_time"
              type="time"
              required
              defaultValue={loop.post_local_time}
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="audience_persona">Audience persona</label>
            <textarea
              id="audience_persona"
              name="audience_persona"
              required
              defaultValue={loop.audience_persona}
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="seed_topics">Seed topics (one per line)</label>
            <textarea
              id="seed_topics"
              name="seed_topics"
              defaultValue={loop.seed_topics.join("\n")}
            />
          </div>

          <div className={styles.formRow}>
            <label htmlFor="feedback_prompt_text">Feedback prompt text</label>
            <textarea
              id="feedback_prompt_text"
              name="feedback_prompt_text"
              defaultValue={loop.feedback_prompt_text ?? ""}
            />
            <div className={styles.formHint}>
              Empty = use default copy. Set custom text to override. The publisher
              uses an explicit empty string to suppress; manage that via the API
              directly if needed.
            </div>
          </div>

          <div className={styles.formRow}>
            <label>
              <input type="checkbox" name="active" defaultChecked={loop.active} /> Active
            </label>
          </div>

          <div className={styles.formActions}>
            <button className={styles.btnPrimary} type="submit">
              Save changes
            </button>
          </div>
        </form>

        <form action={deleteLoopAction} className={styles.form} style={{ marginTop: 8 }}>
          <input type="hidden" name="loop_id" value={loop.loop_id} />
          <div className={styles.formRow}>
            <strong>Delete this loop</strong>
            <div className={styles.formHint}>
              Removes the config but keeps any episodes already in Firestore.
              Cloud Scheduler entries are not touched — delete those via gcloud.
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnDanger} type="submit">
              Delete loop
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className={styles.headerTitle} style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>
          Episodes
        </h2>
        {episodes.length === 0 && (
          <div className={styles.tableWrap}>
            <div className={styles.empty}>
              No episodes yet. Hit “Run now” above or wait for the scheduled cadence.
            </div>
          </div>
        )}
        {episodes.map((episode) => (
          <EpisodeCard key={episode.episode_id} episode={episode} loopId={loop!.loop_id} />
        ))}
      </section>
    </div>
  );
}

function EpisodeCard({ episode, loopId }: { episode: BroadcastEpisode; loopId: string }) {
  const hasFeedback = Boolean(episode.feedback_summary || episode.feedback_raw);
  return (
    <div className={styles.episode}>
      <div className={styles.episodeHeader}>
        <h3 className={styles.episodeTitle}>{episode.title}</h3>
        <span className={styles.episodeMeta}>{episode.run_date}</span>
      </div>
      <div className={styles.episodeBody}>
        <strong>Topic:</strong> {episode.topic_used}
      </div>
      <div className={styles.episodeLinks}>
        {episode.episode_tweet_url && (
          <a href={episode.episode_tweet_url} target="_blank" rel="noopener noreferrer">
            Open tweet ↗
          </a>
        )}
        {episode.feedback_prompt_tweet_url && (
          <a href={episode.feedback_prompt_tweet_url} target="_blank" rel="noopener noreferrer">
            Feedback prompt reply ↗
          </a>
        )}
      </div>

      {episode.feedback_summary && (
        <div className={styles.feedbackSummary}>
          <strong>Summary:</strong> {episode.feedback_summary}
        </div>
      )}

      <form action={pasteFeedbackAction} className={styles.feedbackForm}>
        <input type="hidden" name="episode_id" value={episode.episode_id} />
        <input type="hidden" name="loop_id" value={loopId} />
        <label htmlFor={`feedback-${episode.episode_id}`}>
          {hasFeedback ? "Replace pasted feedback" : "Paste replies from X"}
        </label>
        <textarea
          id={`feedback-${episode.episode_id}`}
          name="feedback_text"
          placeholder="One reply per line or block. Spam and emoji-only reactions will be ignored."
        />
        <div className={styles.formActions}>
          <button className={styles.btnSecondary} type="submit">
            Save feedback
          </button>
        </div>
      </form>
    </div>
  );
}
