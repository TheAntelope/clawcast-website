"use client";

import { useEffect, useState } from "react";

import type { GenerateUserResult } from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";

const STORAGE_KEY = "studio.generate.identifier";

// Derive the token-gated media URL from the returned feed_url + episode id:
//   {base}/feeds/{token}.xml  ->  {base}/media/{token}/{episodeId}.mp3
function deriveMediaUrl(result: GenerateUserResult | null): string | null {
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
  const [result, setResult] = useState<GenerateUserResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hydration-safe: render empty on the server, then populate from
    // localStorage after mount (this is the documented pattern for a
    // client-only persisted value, so the set-state-in-effect rule doesn't
    // apply here).
    const saved = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setIdentifier(saved);
  }, []);

  async function run() {
    const id = identifier.trim();
    if (!id) {
      setError("Enter your email or user id.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, id);
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/admin/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Generation failed");
      } else {
        setResult(data as GenerateUserResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const mediaUrl = deriveMediaUrl(result);
  const status = result?.run?.status;

  return (
    <div className={styles.tableWrap} style={{ padding: "1rem", marginBottom: "1.5rem" }}>
      <h2 className={styles.headerTitle}>Generate my pod (hear the current blueprint)</h2>
      <p className={styles.formHint}>
        Runs the real generation pipeline for your account with the currently
        saved blueprint and publishes to your feed — so you hear the genuine
        article, then tweak above and regenerate. Costs OpenAI/ElevenLabs and
        takes a minute or two.
      </p>
      <div className={styles.formRow}>
        <label htmlFor="gen_identifier">Your email or user id</label>
        <input
          id="gen_identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={run}
          disabled={busy}
        >
          {busy ? "Generating… (this can take a minute)" : "Generate & listen"}
        </button>
      </div>
      {error && <div className={styles.notice}>{error}</div>}
      {result && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className={styles.formHint}>
            Status: <strong>{status ?? "unknown"}</strong>
            {result.episode?.title ? ` · ${result.episode.title}` : ""}
            {result?.run?.message ? ` · ${result.run.message}` : ""}
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
        </div>
      )}
    </div>
  );
}
