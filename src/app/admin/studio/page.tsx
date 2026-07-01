import Link from "next/link";

import {
  NewsletterPodConfigError,
  getBlueprint,
  listBlueprintHistory,
  type BlueprintVersion,
} from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";
import { saveBlueprintAction, restoreBlueprintAction } from "./actions";
import { StudioEditor } from "./StudioEditor";
import { GenerateMyPod } from "./GenerateMyPod";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function flash(params: SearchParams, key: string): string | null {
  const v = params[key];
  return typeof v === "string" ? v : null;
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  let active: BlueprintVersion | null = null;
  let history: BlueprintVersion[] = [];
  let error: string | null = null;
  try {
    active = await getBlueprint();
    history = await listBlueprintHistory();
  } catch (err) {
    if (err instanceof NewsletterPodConfigError) {
      error =
        "NEWSLETTER_POD_URL and NEWSLETTER_POD_JOB_TRIGGER_TOKEN must be configured in env.";
    } else {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  const saveSuccess = flash(params, "save_success");
  const saveError = flash(params, "save_error");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Podcast shaping studio</h1>
        <div className={styles.headerActions}>
          <Link className={styles.btnSecondary} href="/admin/broadcast">
            Broadcast loops →
          </Link>
        </div>
      </header>

      <p className={styles.formHint}>
        Shapes the default structure and style of every user&apos;s daily
        briefing. Saving creates a new version that takes effect on the next pod
        — no redeploy.
        {active &&
          (active.is_default
            ? " Currently serving the built-in default (nothing saved yet)."
            : ` Active version: v${active.version}.`)}
      </p>

      {error && <div className={styles.notice}>{error}</div>}
      {saveSuccess && <div className={styles.notice}>{saveSuccess}</div>}
      {saveError && <div className={styles.notice}>{saveError}</div>}

      {!error && <GenerateMyPod />}

      {!error && active && (
        <form action={saveBlueprintAction} className={styles.form}>
          <StudioEditor initial={active.blueprint} />
          <div className={styles.formRow}>
            <label htmlFor="note">Change note (optional)</label>
            <input id="note" name="note" type="text" placeholder="e.g. drop weather, add markets" />
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnPrimary} type="submit">
              Save new version
            </button>
          </div>
        </form>
      )}

      {!error && history.length > 0 && (
        <>
          <h2 className={styles.headerTitle} style={{ marginTop: "2rem" }}>
            Version history
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Updated</th>
                  <th>By</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((v) => (
                  <tr key={v.version}>
                    <td>v{v.version}</td>
                    <td>{formatDate(v.updated_at)}</td>
                    <td>{v.updated_by ?? "—"}</td>
                    <td>{v.note ?? "—"}</td>
                    <td>
                      <form action={restoreBlueprintAction}>
                        <input type="hidden" name="version" value={v.version} />
                        <button className={styles.btnSecondary} type="submit">
                          Restore
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
