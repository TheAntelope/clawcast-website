"use client";

import { useEffect, useRef, useState } from "react";

import type {
  LatestPodResult,
  PodStatusResult,
  StartPodResult,
} from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";

const STORAGE_KEY = "studio.generate.identifier";
const POLL_MS = 4000;
// Budget in SUCCESSFUL polls (~6 min of real generating time) — generous
// because a durable background run can run long under load, and polling a
// finished-but-slow run is near-free. Transient poll errors don't count against
// this (they have their own small budget).
const MAX_POLLS = 90;
const MAX_POLL_ERRORS = 8; // give up only after this many consecutive poll failures

// A run is done when it reaches any of these; anything else (in_progress) keeps
// polling.
const TERMINAL = new Set([
  "published",
  "skipped",
  "no_content",
  "pre_access",
  "failed",
]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// {base}/feeds/{token}.xml -> {base}/media/{token}/{episodeId}.mp3
function deriveMediaUrl(
  result: { episode?: { id?: string } | null; feed_url?: string | null } | null,
): string | null {
  const feed = result?.feed_url;
  const epId = result?.episode?.id;
  if (!feed || !epId) return null;
  const m = feed.match(/^(.*)\/feeds\/([^/]+)\.xml$/);
  if (!m) return null;
  return `${m[1]}/media/${m[2]}/${epId}.mp3`;
}

export function GenerateMyPod() {
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState<PodStatusResult | null>(null);
  const [latest, setLatest] = useState<LatestPodResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setIdentifier(saved);
    return () => {
      cancelRef.current = true;
    };
  }, []);

  async function run() {
    const id = identifier.trim();
    if (!id) {
      setError("Enter your email or user id.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, id);
    cancelRef.current = false;
    setBusy(true);
    setError(null);
    setResult(null);
    setLatest(null);
    setTimedOut(false);
    setStatusText("Starting…");

    try {
      const startRes = await fetch("/admin/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) {
        setError(typeof startData?.error === "string" ? startData.error : "Could not start generation");
        setBusy(false);
        return;
      }
      const { user_id: userId, run } = startData as StartPodResult;
      const runId = run?.id;
      if (!userId || !runId) {
        setError("Backend did not return a run to track.");
        setBusy(false);
        return;
      }

      let current: PodStatusResult = { run };
      setResult(current);
      const started = Date.now();
      let polls = 0;
      let errors = 0;
      while (
        !TERMINAL.has(current.run?.status ?? "") &&
        polls < MAX_POLLS &&
        errors < MAX_POLL_ERRORS
      ) {
        await sleep(POLL_MS);
        if (cancelRef.current) return;
        setStatusText(`Generating your pod… (${Math.round((Date.now() - started) / 1000)}s)`);
        let ok = false;
        let sData: PodStatusResult | null = null;
        try {
          const sRes = await fetch(
            `/admin/studio/generate/status?user_id=${encodeURIComponent(userId)}&run_id=${encodeURIComponent(runId)}`,
          );
          if (sRes.ok) {
            sData = (await sRes.json()) as PodStatusResult;
            ok = true;
          }
        } catch {
          // network blip — treated as a transient error below
        }
        if (!ok || !sData) {
          // Transient poll failure: don't burn the run-duration budget for it.
          errors += 1;
          continue;
        }
        errors = 0;
        polls += 1;
        current = sData;
        setResult(current);
      }
      if (!TERMINAL.has(current.run?.status ?? "")) setTimedOut(true);

      // No fresh pod (no new content / skipped / still running) — fall back to
      // the account's most recent existing pod so there's something to play.
      if (current.run?.status !== "published") {
        try {
          const lRes = await fetch(
            `/admin/studio/generate/latest?user_id=${encodeURIComponent(userId)}`,
          );
          if (lRes.ok) {
            const lData = (await lRes.json()) as LatestPodResult;
            if (!cancelRef.current && lData?.episode?.id) setLatest(lData);
          }
        } catch {
          // best-effort — the reason message still shows
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const status = result?.run?.status;
  const message = (result?.run?.message as string | undefined) ?? "";
  const mediaUrl = deriveMediaUrl(result);
  const latestMediaUrl = deriveMediaUrl(latest);

  return (
    <div className={styles.tableWrap} style={{ padding: "1rem", marginBottom: "1.5rem" }}>
      <h2 className={styles.headerTitle}>Generate my pod (hear the current blueprint)</h2>
      <p className={styles.formHint}>
        Runs the real generation pipeline for your account with the currently
        saved blueprint and publishes to your feed. Costs OpenAI/ElevenLabs and
        takes a minute or two — it now runs in the background, so this won&apos;t
        time out.
      </p>
      <div className={styles.formRow}>
        <label htmlFor="gen_identifier">Your email or user id</label>
        <input
          id="gen_identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
          disabled={busy}
        />
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnPrimary} onClick={run} disabled={busy}>
          {busy ? statusText || "Generating…" : "Generate & listen"}
        </button>
      </div>

      {error && <div className={styles.notice}>{error}</div>}

      {result && !error && (
        <div style={{ marginTop: "0.75rem" }}>
          {status === "published" && (
            <>
              <div className={styles.formHint}>
                ✓ Published{result.episode?.title ? ` · ${result.episode.title}` : ""}
              </div>
              {mediaUrl && (
                <audio controls src={mediaUrl} style={{ width: "100%", marginTop: "0.5rem" }}>
                  <track kind="captions" />
                </audio>
              )}
              {result.feed_url && (
                <div className={styles.formHint} style={{ marginTop: "0.5rem" }}>
                  Feed:{" "}
                  <a href={result.feed_url} target="_blank" rel="noreferrer">
                    {result.feed_url}
                  </a>
                </div>
              )}
            </>
          )}

          {status === "skipped" && (
            <div className={styles.notice}>
              Skipped — {message || "no pod generated"}.
            </div>
          )}
          {status === "no_content" && (
            <div className={styles.notice}>
              {message || "No new content to build a pod from right now."}
            </div>
          )}
          {status === "pre_access" && (
            <div className={styles.notice}>{message || "Account not eligible yet."}</div>
          )}
          {status === "failed" && (
            <div className={styles.notice}>Failed — {message || "generation error"}.</div>
          )}

          {status !== "published" && latest?.episode?.id && (
            <div style={{ marginTop: "0.5rem" }}>
              <div className={styles.formHint}>
                Here&apos;s your most recent pod
                {latest.episode.title ? `: ${latest.episode.title}` : ""}.
              </div>
              {latestMediaUrl && (
                <audio controls src={latestMediaUrl} style={{ width: "100%", marginTop: "0.5rem" }}>
                  <track kind="captions" />
                </audio>
              )}
              {latest.feed_url && (
                <div className={styles.formHint} style={{ marginTop: "0.5rem" }}>
                  Feed:{" "}
                  <a href={latest.feed_url} target="_blank" rel="noreferrer">
                    {latest.feed_url}
                  </a>
                </div>
              )}
            </div>
          )}

          {busy && !TERMINAL.has(status ?? "") && (
            <div className={styles.formHint}>{statusText}</div>
          )}
          {timedOut && !TERMINAL.has(status ?? "") && (
            <div className={styles.notice}>
              Still generating — it&apos;ll land in your feed shortly.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
