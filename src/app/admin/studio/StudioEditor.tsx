"use client";

import type {
  BlueprintDetailLevel,
  BlueprintSection,
  ShowBlueprint,
} from "@/lib/newsletter-pod";
import styles from "../broadcast/admin.module.css";

const DETAIL_LEVELS: BlueprintDetailLevel[] = ["headline", "shallow", "standard", "deep"];

type Props = {
  // Controlled by StudioWorkspace, which owns the draft so the transcript panel
  // and "regenerate with these edits" share the exact same blueprint.
  bp: ShowBlueprint;
  update: (mutator: (draft: ShowBlueprint) => void) => void;
};

// The left editor column: segments (order/detail/instructions) plus the style,
// music, prediction and closing config. Pure presentation over the draft owned
// by the parent — every change flows up through `update`.
export function StudioEditor({ bp, update }: Props) {
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
        Script model (experiment)
      </h2>
      <p className={styles.formHint}>
        The OpenAI model that writes the transcript (main script, closing, and
        the de-AI rewrite). Leave blank for the deployed default. Pick a
        suggestion or type any valid OpenAI model id, then use{" "}
        <strong>Draft preview</strong> / <strong>Regenerate with my edits</strong>{" "}
        to compare transcripts. Saving a version makes the chosen model global.
      </p>
      <div className={styles.formRow}>
        <label htmlFor="text_model">Model</label>
        <input
          id="text_model"
          type="text"
          list="studio-model-suggestions"
          placeholder="default (gpt-5.4-mini)"
          value={bp.text_model ?? ""}
          onChange={(e) => update((d) => (d.text_model = e.target.value.trim() || null))}
        />
        <datalist id="studio-model-suggestions">
          <option value="gpt-5.4-mini" />
          <option value="gpt-5.4" />
          <option value="gpt-4o" />
          <option value="gpt-4o-mini" />
        </datalist>
        <div className={styles.formHint}>
          Blank = deployed default. An unknown model id fails loudly at generate
          time, never silently.
        </div>
      </div>

      <h2 className={styles.headerTitle} style={{ marginTop: "1.5rem" }}>
        Intro music
      </h2>
      <p className={styles.formHint}>
        Headlines and weather are ordinary sections above — enable/disable and
        reorder them there. Weather is additionally gated per-user (only voiced
        when the listener has set a location). Intro/outro music is spliced into
        the audio when you <strong>regenerate with these edits</strong> (not the
        text preview) — the asset must already be uploaded to GCS.
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
  );
}
