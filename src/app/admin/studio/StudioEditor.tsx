"use client";

import { useState } from "react";

import type {
  BlueprintDetailLevel,
  BlueprintPreview,
  BlueprintSection,
  ShowBlueprint,
} from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";

const DETAIL_LEVELS: BlueprintDetailLevel[] = ["headline", "shallow", "standard", "deep"];

type Props = {
  initial: ShowBlueprint;
};

// Deep-clones the incoming blueprint so edits don't mutate the server payload,
// then serializes the current state into a single hidden input (blueprint_json)
// that the saveBlueprintAction reads. The backend is the authoritative
// validator — this UI only has to produce a well-shaped object.
export function StudioEditor({ initial }: Props) {
  const [bp, setBp] = useState<ShowBlueprint>(() =>
    JSON.parse(JSON.stringify(initial)) as ShowBlueprint,
  );
  const [preview, setPreview] = useState<BlueprintPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  async function runPreview() {
    setPreviewing(true);
    setPreviewError(null);
    try {
      const res = await fetch("/admin/studio/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint: bp, text_only: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(typeof data?.error === "string" ? data.error : "Preview failed");
        setPreview(null);
      } else {
        setPreview(data as BlueprintPreview);
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : String(err));
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  }

  function update(mutator: (draft: ShowBlueprint) => void) {
    setBp((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as ShowBlueprint;
      mutator(next);
      return next;
    });
  }

  function updateSection(index: number, patch: Partial<BlueprintSection>) {
    update((d) => {
      d.sections[index] = { ...d.sections[index], ...patch };
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= bp.sections.length) return;
    update((d) => {
      const [row] = d.sections.splice(index, 1);
      d.sections.splice(target, 0, row);
    });
  }

  return (
    <div>
      <input type="hidden" name="blueprint_json" value={JSON.stringify(bp)} />

      <div className={styles.studioSplit}>
        {/* LEFT: the editor (segments + config) */}
        <div>
          <h2 className={styles.headerTitle}>Segments (on-air order)</h2>
          <p className={styles.formHint}>
            Reorder, toggle, and set how deep each section goes. The last enabled
            section must be the closing.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {bp.sections.map((section, i) => (
              <fieldset key={`${section.kind}-${i}`} className={styles.sourceGroup}>
                <legend className={styles.sourceGroupLegend}>
                  {i + 1}. {section.kind}
                </legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) => updateSection(i, { enabled: e.target.checked })}
                    />{" "}
                    Enabled
                  </label>
                  <label>
                    Detail{" "}
                    <select
                      value={section.detail_level}
                      onChange={(e) =>
                        updateSection(i, { detail_level: e.target.value as BlueprintDetailLevel })
                      }
                    >
                      {DETAIL_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Words override{" "}
                    <input
                      type="number"
                      min={10}
                      max={1200}
                      style={{ width: "5.5rem" }}
                      value={section.target_words ?? ""}
                      onChange={(e) =>
                        updateSection(i, {
                          target_words: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  {section.kind === "story_block" && (
                    <label>
                      Max blocks{" "}
                      <input
                        type="number"
                        min={1}
                        max={8}
                        style={{ width: "4rem" }}
                        value={section.max_blocks ?? ""}
                        onChange={(e) =>
                          updateSection(i, {
                            max_blocks: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  )}
                  <span style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => move(i, 1)}
                      disabled={i === bp.sections.length - 1}
                    >
                      ↓
                    </button>
                  </span>
                </div>
                <div className={styles.formRow} style={{ marginTop: "0.5rem" }}>
                  <textarea
                    placeholder={`Instructions for the ${section.kind} section (optional)`}
                    value={section.instructions ?? ""}
                    onChange={(e) =>
                      updateSection(i, { instructions: e.target.value || null })
                    }
                  />
                </div>
              </fieldset>
            ))}
          </div>

          <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
            Intro music
          </h2>
          <p className={styles.formHint}>
            Headlines and weather are ordinary sections above — enable/disable and
            reorder them there. Weather is additionally gated per-user (only voiced
            when the listener has set a location).
          </p>
          <div className={styles.formRow}>
            <label>
              <input
                type="checkbox"
                checked={bp.opening.intro_music_enabled}
                onChange={(e) => update((d) => (d.opening.intro_music_enabled = e.target.checked))}
              />{" "}
              Intro music bed
            </label>
            <input
              type="text"
              placeholder="music/intro.mp3 (GCS object name)"
              value={bp.opening.intro_music_asset ?? ""}
              onChange={(e) =>
                update((d) => (d.opening.intro_music_asset = e.target.value || null))
              }
            />
          </div>

          <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
            Style guardrails (fight the &ldquo;sounds like AI&rdquo; tics)
          </h2>
          <div className={styles.formRow}>
            <label>
              <input
                type="checkbox"
                checked={bp.style.lint_enabled}
                onChange={(e) => update((d) => (d.style.lint_enabled = e.target.checked))}
              />{" "}
              Enable de-AI rewrite pass
            </label>
            <label>
              Max segments to rewrite{" "}
              <input
                type="number"
                min={0}
                max={8}
                style={{ width: "4rem" }}
                value={bp.style.max_rewrite_segments}
                onChange={(e) =>
                  update((d) => (d.style.max_rewrite_segments = Number(e.target.value)))
                }
              />
            </label>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="banned">Banned phrases (one per line)</label>
            <textarea
              id="banned"
              placeholder={"this is less\nlet's dive in\ntapestry"}
              value={bp.style.banned_phrases.join("\n")}
              onChange={(e) =>
                update(
                  (d) =>
                    (d.style.banned_phrases = e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)),
                )
              }
            />
            <div className={styles.formHint}>
              Substring or regex. Extends the built-in default list.
            </div>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="positive">Positive style guidance</label>
            <textarea
              id="positive"
              value={bp.style.positive_guidance ?? ""}
              onChange={(e) =>
                update((d) => (d.style.positive_guidance = e.target.value || null))
              }
            />
          </div>

          <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
            Prediction markets (Polymarket)
          </h2>
          <div className={styles.formRow}>
            <label>
              <input
                type="checkbox"
                checked={bp.predictions.enabled}
                onChange={(e) => update((d) => (d.predictions.enabled = e.target.checked))}
              />{" "}
              Weave in relevant market odds
            </label>
            <label>
              Max mentions/episode{" "}
              <input
                type="number"
                min={0}
                max={6}
                style={{ width: "4rem" }}
                value={bp.predictions.max_mentions}
                onChange={(e) =>
                  update((d) => (d.predictions.max_mentions = Number(e.target.value)))
                }
              />
            </label>
            <label>
              Min relevance{" "}
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                style={{ width: "5rem" }}
                value={bp.predictions.min_relevance}
                onChange={(e) =>
                  update((d) => (d.predictions.min_relevance = Number(e.target.value)))
                }
              />
            </label>
          </div>

          <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
            Outro music
          </h2>
          <div className={styles.formRow}>
            <label>
              <input
                type="checkbox"
                checked={bp.music.outro_music_enabled}
                onChange={(e) => update((d) => (d.music.outro_music_enabled = e.target.checked))}
              />{" "}
              Outro music
            </label>
            <input
              type="text"
              placeholder="music/outro.mp3 (GCS object name)"
              value={bp.music.outro_music_asset ?? ""}
              onChange={(e) =>
                update((d) => (d.music.outro_music_asset = e.target.value || null))
              }
            />
          </div>

          <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
            Closing &amp; announcements
          </h2>
          <div className={styles.formRow}>
            <label htmlFor="announcements">Announcements (read verbatim when the section is enabled)</label>
            <textarea
              id="announcements"
              value={bp.closing.announcements_text ?? ""}
              onChange={(e) =>
                update((d) => (d.closing.announcements_text = e.target.value || null))
              }
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="signoff">Sign-off override (optional)</label>
            <input
              id="signoff"
              type="text"
              value={bp.closing.signoff_override ?? ""}
              onChange={(e) =>
                update((d) => (d.closing.signoff_override = e.target.value || null))
              }
            />
          </div>
        </div>

        {/* RIGHT: transcript panel (sticky) */}
        <div className={styles.studioTranscript}>
          <div className={styles.tableWrap} style={{ padding: "1rem" }}>
            <div className={styles.studioTranscriptHead}>
              <h2 className={styles.headerTitle} style={{ margin: 0 }}>
                Transcript
              </h2>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={runPreview}
                disabled={previewing}
              >
                {previewing ? "Previewing…" : "Preview"}
              </button>
            </div>
            <p className={styles.formHint}>
              Dry-runs this draft over sample stories (no TTS spend, saves
              nothing) so you can read the resulting script.
            </p>

            {previewError && <div className={styles.notice}>{previewError}</div>}

            {!preview && !previewing && !previewError && (
              <div className={styles.formHint}>
                Press <strong>Preview</strong> to generate a transcript from the
                current segments and style.
              </div>
            )}

            {preview && (
              <>
                <div className={styles.formHint}>
                  {preview.episode_title} · sections:{" "}
                  {preview.section_order.join(" → ") || "—"} · ~
                  {preview.duration_seconds ?? "?"}s
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
          </div>
        </div>
      </div>
    </div>
  );
}
