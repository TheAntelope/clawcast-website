import Link from "next/link";

import { NewsletterPodConfigError, listLoops, type BroadcastLoop } from "@/lib/newsletter-pod";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function BroadcastAdminPage() {
  let loops: BroadcastLoop[] = [];
  let error: string | null = null;
  try {
    loops = await listLoops();
  } catch (err) {
    if (err instanceof NewsletterPodConfigError) {
      error =
        "NEWSLETTER_POD_URL and NEWSLETTER_POD_JOB_TRIGGER_TOKEN must be configured in env.";
    } else {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Broadcast loops</h1>
        <div className={styles.headerActions}>
          <Link className={styles.btnPrimary} href="/admin/broadcast/loops/new">
            New loop
          </Link>
        </div>
      </header>

      {error && <div className={styles.notice}>{error}</div>}

      {!error && loops.length === 0 && (
        <div className={styles.tableWrap}>
          <div className={styles.empty}>
            No loops yet. Create one to start posting daily broadcasts.
          </div>
        </div>
      )}

      {!error && loops.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Loop</th>
                <th>Region</th>
                <th>Post time</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loops.map((loop) => (
                <tr key={loop.loop_id}>
                  <td>
                    <Link href={`/admin/broadcast/loops/${encodeURIComponent(loop.loop_id)}`}>
                      {loop.loop_id}
                    </Link>
                    <div className={styles.formHint}>{loop.audience_persona}</div>
                  </td>
                  <td>{loop.region}</td>
                  <td>
                    {loop.post_local_time}
                    <div className={styles.formHint}>{loop.timezone}</div>
                  </td>
                  <td>
                    <span className={loop.active ? styles.badgeActive : styles.badgeInactive}>
                      {loop.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td>{formatDate(loop.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
