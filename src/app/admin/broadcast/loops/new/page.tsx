import Link from "next/link";

import { upsertLoopAction } from "../../actions";
import styles from "../../admin.module.css";

export default function NewLoopPage() {
  return (
    <div className={styles.page}>
      <div className={styles.crumbs}>
        <Link href="/admin/broadcast">← All loops</Link>
      </div>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>New broadcast loop</h1>
      </header>

      <form action={upsertLoopAction} className={styles.form}>
        <div className={styles.formRow}>
          <label htmlFor="loop_id">Loop ID</label>
          <input
            id="loop_id"
            name="loop_id"
            type="text"
            required
            pattern="[a-z0-9][a-z0-9_\-]{0,47}"
            placeholder="us-morning"
          />
          <div className={styles.formHint}>
            Lowercase letters, numbers, dashes, underscores. 1-48 chars.
          </div>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="region">Region label</label>
          <input id="region" name="region" type="text" required placeholder="US" />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="timezone">Timezone (IANA)</label>
          <input
            id="timezone"
            name="timezone"
            type="text"
            required
            placeholder="America/Los_Angeles"
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="post_local_time">Post time (local 24h)</label>
          <input
            id="post_local_time"
            name="post_local_time"
            type="time"
            defaultValue="08:00"
            required
          />
          <div className={styles.formHint}>
            Used for documentation only — Cloud Scheduler holds the real cron.
            Update it separately via scripts/schedule_broadcast_loop.sh.
          </div>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="audience_persona">Audience persona</label>
          <textarea
            id="audience_persona"
            name="audience_persona"
            required
            placeholder="Indie founders and builders on X who follow AI tooling launches"
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="seed_topics">Seed topics (one per line)</label>
          <textarea
            id="seed_topics"
            name="seed_topics"
            placeholder={"What Anthropic shipped this week\nOpen-weights ecosystem update"}
          />
          <div className={styles.formHint}>
            Used round-robin for day 1 and as a fallback when LLM topic picking returns nothing.
          </div>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="feedback_prompt_text">Feedback prompt text (optional)</label>
          <textarea
            id="feedback_prompt_text"
            name="feedback_prompt_text"
            placeholder="Leave blank for default copy. Type custom text to override. To suppress the reply entirely, type a single hyphen and remove it after saving."
          />
        </div>

        <div className={styles.formRow}>
          <label>
            <input type="checkbox" name="active" defaultChecked /> Active
          </label>
        </div>

        <div className={styles.formActions}>
          <Link className={styles.btnSecondary} href="/admin/broadcast">
            Cancel
          </Link>
          <button className={styles.btnPrimary} type="submit">
            Create loop
          </button>
        </div>
      </form>
    </div>
  );
}
