"use client";

import { useEffect, useRef, useState } from "react";

import type {
  BlueprintPreview,
  LatestPodResult,
  PodStatusResult,
  ShowBlueprint,
  StartPodResult,
} from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";
import { StudioEditor } from "./StudioEditor";

const STORAGE_KEY = "studio.generate.identifier";
const POLL_MS = 4000;
// Budget in SUCCESSFUL polls (~6 min of real generating time); transient poll
// errors have their own small budget and don't count against this.
const MAX_POLLS = 90;
const MAX_POLL_ERRORS = 8;
// Debounce edits before re-previewing so we don't fire an OpenAI dry-run on
// every keystroke.
const PREVIEW_DEBOUNCE_MS = 900;

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

// The pod currently loaded into the audio player. Its transcript is the aired
// script, so the panel and audio stay in lock-step.
type RealPod = {
  title?: string;
  transcript: string | null;
  mediaUrl: string | null;
  feedUrl?: string | null;
  source: "saved" | "draft";
};

type Props = { initial: ShowBlueprint };

// Coordinates the whole Studio: it owns the draft blueprint so the editor (left),
// the transcript panel (right), the "generate/regenerate" buttons, and the audio
// player all agree. Transcript panel has two modes: the AIRED transcript of the
// pod in the player (matches the audio) and a live DRAFT preview that updates as
// you edit. Rendered inside the Save <form>, so it also emits blueprint_json.
export function StudioWorkspace({ initial }: Props) {
  const [bp, setBp] = useState<ShowBlueprint>(() =>
    JSON.parse(JSON.stringify(initial)) as ShowBlueprint,
  );
  const [identifier, setIdentifier] = useState("");

  // Real generation (shared by both buttons).
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [genMessage, setGenMessage] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [realPod, setRealPod] = useState<RealPod | null>(null);

  // Dry-run preview of the current draft.
  const [preview, setPreview] = useState<BlueprintPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [panelMode, setPanelMode] = useState<"real" | "preview">("preview");

  const cancelRef = useRef(false);
  const didMountRef = useRef(false);
  // Monotonic id so only the newest in-flight preview wins setState — dry-run
  // latency varies, so an earlier request can resolve after a later one.
  const previewSeqRef = useRef(0);
  const bpJson = JSON.stringify(bp);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdentifier(saved);
      // Seed the baseline: show today's actual pod + its transcript immediately,
      // so the panel opens on a real audio/transcript pair to edit against.
      void seedLatest(saved);
    }
    return () => {
      cancelRef.current = true;
    };
  }, []);

  // Auto-refresh the draft preview as segments/style change — skipping the very
  // first render so we don't spend a dry-run on page load.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    // While a real render is in flight the editor is disabled, but guard anyway
    // so a stray change can't fire a dry-run or yank the panel off the aired pod.
    if (busy) return;
    // Intentional: editing switches the panel to the live draft preview.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanelMode("preview");
    const t = setTimeout(() => {
      void runPreview();
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpJson]);

  function update(mutator: (draft: ShowBlueprint) => void) {
    setBp((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as ShowBlueprint;
      mutator(next);
      return next;
    });
  }

  // Load the account's most recent published pod into the player + panel so the
  // Studio opens on a real baseline. Best-effort — a missing/erroring pod just
  // leaves the empty state.
  async function seedLatest(id: string) {
    try {
      const res = await fetch(
        `/admin/studio/generate/latest?identifier=${encodeURIComponent(id)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as LatestPodResult;
      if (cancelRef.current || !data?.episode?.id) return;
      setRealPod({
        title: data.episode.title,
        transcript: data.episode.transcript_text ?? null,
        mediaUrl: deriveMediaUrl(data),
        feedUrl: data.feed_url ?? null,
        source: "saved",
      });
      setPanelMode("real");
    } catch {
      // best-effort baseline — leave the empty state
    }
  }

  async function runPreview() {
    // Only the newest request may write state; stale ones (a slower earlier
    // dry-run) and post-unmount responses are dropped.
    const seq = ++previewSeqRef.current;
    const live = () => seq === previewSeqRef.current && !cancelRef.current;
    setPreviewing(true);
    setPreviewError(null);
    try {
      // Preview AS the account in the generate box (localStorage is the source of
      // truth even before `identifier` state settles), so it uses their real
      // sources + profile. Empty -> the backend falls back to sample stories.
      const id =
        (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) ||
        identifier ||
        "";
      const res = await fetch("/admin/studio/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint: bp, text_only: true, identifier: id }),
      });
      const data = await res.json();
      if (!live()) return;
      if (!res.ok) {
        setPreviewError(typeof data?.error === "string" ? data.error : "Preview failed");
      } else {
        setPreview(data as BlueprintPreview);
      }
    } catch (err) {
      if (!live()) return;
      setPreviewError(err instanceof Error ? err.message : String(err));
    } finally {
      if (live()) setPreviewing(false);
    }
  }

  // useDraft=false -> hear the saved/global blueprint (the starting point).
  // useDraft=true  -> render THIS draft for real (audio + intro/outro music),
  // without saving it globally.
  async function runGeneration(useDraft: boolean) {
    const id = identifier.trim();
    if (!id) {
      setGenError("Enter your email or user id.");
      return;
    }
    localStorage.setItem(STORAGE_KEY, id);
    cancelRef.current = false;
    setBusy(true);
    setGenError(null);
    setGenStatus(null);
    setGenMessage("");
    setTimedOut(false);
    setStatusText("Starting…");

    try {
      const startRes = await fetch("/admin/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, blueprint: useDraft ? bp : null }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) {
        setGenError(
          typeof startData?.error === "string" ? startData.error : "Could not start generation",
        );
        setBusy(false);
        return;
      }
      const { user_id: userId, run, started: didStart } = startData as StartPodResult;
      const runId = run?.id;
      if (!userId || !runId) {
        setGenError("Backend did not return a run to track.");
        setBusy(false);
        return;
      }
      // A draft override is only applied to a freshly-started run. If a run is
      // already in flight (started=false) the backend keeps its original
      // blueprint — so DON'T poll+relabel it as "your edits". Stop with a clear
      // message instead of showing a non-draft pod as the draft.
      if (useDraft && didStart === false) {
        setGenError(
          "A generation is already running for this account — wait for it to finish, then click “Regenerate with my edits” again.",
        );
        setBusy(false);
        return;
      }

      let current: PodStatusResult = { run };
      setGenStatus(run?.status ?? null);
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
        setStatusText(
          `${useDraft ? "Rendering your edits" : "Generating your pod"}… (${Math.round(
            (Date.now() - started) / 1000,
          )}s)`,
        );
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
          // network blip — transient, handled below
        }
        if (!ok || !sData) {
          errors += 1;
          continue;
        }
        errors = 0;
        polls += 1;
        current = sData;
        setGenStatus(current.run?.status ?? null);
      }

      const st = current.run?.status ?? "";
      if (!TERMINAL.has(st)) setTimedOut(true);
      setGenMessage((current.run?.message as string | undefined) ?? "");

      if (st === "published") {
        setRealPod({
          title: current.episode?.title,
          transcript: current.episode?.transcript_text ?? null,
          mediaUrl: deriveMediaUrl(current),
          feedUrl: current.feed_url ?? null,
          source: useDraft ? "draft" : "saved",
        });
        setPanelMode("real");
      } else {
        // No fresh pod (skipped / no content / still running) — fall back to the
        // account's most recent existing pod so there's something to hear + read.
        try {
          const lRes = await fetch(
            `/admin/studio/generate/latest?user_id=${encodeURIComponent(userId)}`,
          );
          if (lRes.ok) {
            const lData = (await lRes.json()) as LatestPodResult;
            if (!cancelRef.current && lData?.episode?.id) {
              setRealPod({
                title: lData.episode.title,
                transcript: lData.episode.transcript_text ?? null,
                mediaUrl: deriveMediaUrl(lData),
                feedUrl: lData.feed_url ?? null,
                source: "saved",
              });
              setPanelMode("real");
            }
          }
        } catch {
          // best-effort — the reason message still shows
        }
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const skipReason =
    genStatus && genStatus !== "published" && genStatus !== "in_progress"
      ? genMessage ||
        (genStatus === "no_content"
          ? "No new content to build a pod from right now."
          : genStatus === "pre_access"
            ? "Account not eligible yet."
            : genStatus === "failed"
              ? "Generation error."
              : "No pod generated.")
      : null;

  return (
    <div>
      {/* Emits the draft to the surrounding Save <form>. */}
      <input type="hidden" name="blueprint_json" value={bpJson} />

      {/* Generate / regenerate panel + shared audio player */}
      <div className={styles.tableWrap} style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <h2 className={styles.headerTitle}>Generate my pod</h2>
        <p className={styles.formHint}>
          <strong>Generate &amp; listen</strong> renders your account&apos;s pod
          with the currently <em>saved</em> blueprint — your starting point.{" "}
          <strong>Regenerate with my edits</strong> renders the unsaved draft on
          the left for real (audio, incl. intro/outro music) without changing
          anyone else&apos;s pod. Both publish to your feed and take a minute or
          two — they run in the background, so this won&apos;t time out. Heads
          up: each real render publishes to your feed and counts against this
          account&apos;s weekly pod quota (use the text preview on the right to
          iterate for free).
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
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => runGeneration(false)}
            disabled={busy}
          >
            {busy ? statusText || "Generating…" : "Generate & listen"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => runGeneration(true)}
            disabled={busy}
            title="Render the unsaved draft on the left for real"
          >
            Regenerate with my edits
          </button>
        </div>

        {genError && <div className={styles.notice}>{genError}</div>}

        {realPod && (
          <div style={{ marginTop: "0.75rem" }}>
            <div className={styles.formHint}>
              {panelMode === "preview"
                ? "Previously rendered — your edits aren’t in this audio yet"
                : realPod.source === "draft"
                  ? "✓ Aired your edits"
                  : "✓ Playing"}
              {realPod.title ? ` · ${realPod.title}` : ""}
            </div>
            {realPod.mediaUrl && (
              <audio controls src={realPod.mediaUrl} style={{ width: "100%", marginTop: "0.5rem" }}>
                <track kind="captions" />
              </audio>
            )}
            {realPod.feedUrl && (
              <div className={styles.formHint} style={{ marginTop: "0.5rem" }}>
                Feed:{" "}
                <a href={realPod.feedUrl} target="_blank" rel="noreferrer">
                  {realPod.feedUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {skipReason && (
          <div className={styles.notice} style={{ marginTop: "0.5rem" }}>
            {genStatus === "skipped" ? "Skipped — " : ""}
            {skipReason}
            {realPod ? " Showing your most recent pod instead." : ""}
          </div>
        )}
        {busy && !TERMINAL.has(genStatus ?? "") && (
          <div className={styles.formHint}>{statusText}</div>
        )}
        {timedOut && !TERMINAL.has(genStatus ?? "") && (
          <div className={styles.notice}>
            Still generating — it&apos;ll land in your feed shortly.
          </div>
        )}
      </div>

      {/* Editor (left) + transcript (right) */}
      <div className={styles.studioSplit}>
        {/* A disabled fieldset natively disables every control inside it, so the
            draft can't change mid-render (which would race the preview and
            decouple the panel from the just-rendered audio). */}
        <fieldset
          disabled={busy}
          style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}
        >
          <StudioEditor bp={bp} update={update} />
        </fieldset>

        <div className={styles.studioTranscript}>
          <div className={styles.tableWrap} style={{ padding: "1rem" }}>
            <div className={styles.studioTranscriptHead}>
              <h2 className={styles.headerTitle} style={{ margin: 0 }}>
                Transcript
              </h2>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setPanelMode("real")}
                  disabled={!realPod || panelMode === "real"}
                  title="The script of the pod in the player above"
                >
                  Aired
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setPanelMode("preview");
                    void runPreview();
                  }}
                  disabled={previewing}
                  title="Dry-run the current draft (no TTS, saves nothing)"
                >
                  {previewing ? "Preview…" : "Draft preview"}
                </button>
              </div>
            </div>

            {panelMode === "real" ? (
              realPod ? (
                <>
                  <div className={styles.formHint}>
                    Aired script{realPod.title ? ` · ${realPod.title}` : ""} —
                    matches the audio above
                    {realPod.source === "draft" ? " (your edits)" : ""}.
                  </div>
                  {realPod.transcript ? (
                    <pre className={styles.transcriptBox}>{realPod.transcript}</pre>
                  ) : (
                    <div className={styles.formHint}>
                      This pod has no stored transcript.
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.formHint}>
                  Generate a pod to see its transcript here.
                </div>
              )
            ) : (
              <>
                <p className={styles.formHint}>
                  Draft preview — the script for your current edits (no TTS, saves
                  nothing). Music isn&apos;t in the text; press{" "}
                  <strong>Regenerate with my edits</strong> above to hear it for
                  real.
                </p>
                {preview?.previewed_as && (
                  <div className={styles.formHint}>
                    Previewing as <strong>{preview.previewed_as}</strong>
                    {typeof preview.source_item_count === "number"
                      ? ` · ${preview.source_item_count} source item(s)`
                      : ""}
                  </div>
                )}
                {previewError && <div className={styles.notice}>{previewError}</div>}
                {!preview && previewing && (
                  <div className={styles.formHint}>Generating preview…</div>
                )}
                {!preview && !previewing && !previewError && (
                  <div className={styles.formHint}>
                    Edit segments or style on the left and the preview updates
                    here.
                  </div>
                )}
                {preview && (
                  <>
                    <div className={styles.formHint}>
                      {preview.episode_title} · sections:{" "}
                      {preview.section_order.join(" → ") || "—"} · ~
                      {preview.duration_seconds ?? "?"}s
                      {previewing ? " · updating…" : ""}
                    </div>
                    {preview.lint_hits.length > 0 && (
                      <div className={styles.notice}>
                        Residual style tics in {preview.lint_hits.length} segment(s)
                        after rewrite.
                      </div>
                    )}
                    {preview.market_hints.length > 0 && (
                      <ul className={styles.formHint}>
                        {preview.market_hints.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                    <pre className={styles.transcriptBox}>{preview.transcript}</pre>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
