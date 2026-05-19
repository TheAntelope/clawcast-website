"use client";

import { useCallback, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PremiumVoice } from "@/lib/elevenlabs";
import { submitVoiceClone, type ActionResult } from "../actions";
import styles from "../wizard.module.css";
import { VoiceRecorder } from "./VoiceRecorder";

const initial: ActionResult = {};

const SCRIPT_PARAGRAPHS: string[] = [
  "Hi. The point of this little reading is to give the system enough of your voice to learn from — your cadence, your warmth, the way you go up at the end of a question. Don't try to sound like a podcaster. Try to sound like yourself on a Tuesday.",
  "Here's a story. Last week I tried to make sourdough. I had read three articles and watched two videos, and I felt, frankly, ready. By Wednesday my starter looked like wallpaper paste. By Thursday it had developed what I can only describe as a personality. On Friday it bubbled, which I took as encouragement. On Saturday it deflated, which I took personally.",
  "The loaf, when it finally arrived, was the size and density of a small ottoman. My partner — generously — called it rustic. We used it as a doorstop for two days, and then a paperweight, and then, with butter, as the actual loaf of bread we ate, like that had been the plan all along.",
  "If you're still reading, thank you. Try a question now: what's the best podcast you've ever fallen asleep to? Mine is one about glaciers. Three episodes in, I still don't know what a glacier is, but I trust the narrator. That's the goal here, actually — people won't remember which sentence you said, only whether they wanted to hear another.",
  "One more bit. Numbers and unusual words help the model stretch: seven, fourteen, nineteen ninety-one, two and a half thousand, microphone, espresso, archipelago, cinnamon, regardless, particularly. Read those last few like you mean them.",
  "Okay — we have enough. Hit stop, and the wizard will take it from there.",
];

type SampleInfo = {
  source: "recording" | "upload";
  name: string;
  sizeBytes: number;
};

type Mode = "clone" | "premium";

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function VoiceForm({
  defaultName,
  premiumVoices,
}: {
  defaultName?: string;
  premiumVoices: readonly PremiumVoice[];
}) {
  const [state, formAction] = useActionState(submitVoiceClone, initial);
  const submissionInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [sample, setSample] = useState<SampleInfo | null>(null);
  const [mode, setMode] = useState<Mode>("clone");
  const [premiumId, setPremiumId] = useState<string>("");
  const [name, setName] = useState<string>(defaultName ?? "");

  const attachFile = useCallback((file: File): void => {
    const input = submissionInputRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
  }, []);

  const handleRecorded = useCallback(
    (file: File): void => {
      attachFile(file);
      setSample({
        source: "recording",
        name: file.name,
        sizeBytes: file.size,
      });
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    },
    [attachFile],
  );

  const handleCleared = useCallback((): void => {
    if (submissionInputRef.current) submissionInputRef.current.value = "";
    setSample((prev) => (prev?.source === "recording" ? null : prev));
  }, []);

  const handleUploadPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0];
      if (!file) {
        if (submissionInputRef.current) submissionInputRef.current.value = "";
        setSample(null);
        return;
      }
      attachFile(file);
      setSample({ source: "upload", name: file.name, sizeBytes: file.size });
    },
    [attachFile],
  );

  const handlePremiumPick = useCallback(
    (voice: PremiumVoice): void => {
      setPremiumId(voice.id);
      if (!name.trim()) setName(voice.name);
    },
    [name],
  );

  const ready =
    mode === "clone" ? Boolean(sample) : premiumId.length > 0;

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="mode" value={mode} />

      <div className={styles.field}>
        <span className={styles.label}>How should your show sound?</span>
        <div className={styles.modeToggle} role="radiogroup">
          <label
            className={`${styles.modeOption} ${
              mode === "clone" ? styles.modeOptionActive : ""
            }`}
          >
            <input
              type="radio"
              name="voice_mode"
              value="clone"
              checked={mode === "clone"}
              onChange={() => setMode("clone")}
              className={styles.modeRadio}
            />
            <span className={styles.modeOptionLabel}>Clone my voice</span>
            <span className={styles.modeOptionMeta}>
              Read a short script — listeners hear you.
            </span>
          </label>
          <label
            className={`${styles.modeOption} ${
              mode === "premium" ? styles.modeOptionActive : ""
            }`}
          >
            <input
              type="radio"
              name="voice_mode"
              value="premium"
              checked={mode === "premium"}
              onChange={() => setMode("premium")}
              className={styles.modeRadio}
            />
            <span className={styles.modeOptionLabel}>Use a premium voice</span>
            <span className={styles.modeOptionMeta}>
              Skip recording and pick a ready-made voice from our ElevenLabs
              roster.
            </span>
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="voice-name" className={styles.label}>
          Voice name
        </label>
        <input
          id="voice-name"
          name="name"
          type="text"
          required
          maxLength={64}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maya Patel"
          className={styles.input}
        />
        <span className={styles.hint}>
          Just for your dashboard — listeners never see this label.
        </span>
      </div>

      {mode === "clone" ? (
        <>
          <div className={styles.field}>
            <span className={styles.label}>Read this aloud</span>
            <div
              className={styles.script}
              role="region"
              aria-label="Voice cloning script"
            >
              {SCRIPT_PARAGRAPHS.map((p, i) => (
                <p key={i} className={styles.scriptPara}>
                  {p}
                </p>
              ))}
            </div>
            <span className={styles.hint}>
              About two minutes at a natural pace. Stumble, restart, laugh —
              all fine. The model wants real speech, not perfection.
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Record your voice</span>
            <VoiceRecorder
              onRecorded={handleRecorded}
              onCleared={handleCleared}
            />
          </div>

          <details className={styles.fallback}>
            <summary className={styles.fallbackSummary}>
              Or upload an audio file instead
            </summary>
            <div className={styles.fallbackBody}>
              <input
                ref={uploadInputRef}
                type="file"
                accept="audio/*"
                onChange={handleUploadPick}
                className={styles.input}
              />
              <span className={styles.hint}>
                1–5 minutes of you reading any text. MP3, WAV, or M4A. Max
                14MB.
              </span>
            </div>
          </details>

          <input
            ref={submissionInputRef}
            type="file"
            name="sample"
            accept="audio/*"
            tabIndex={-1}
            aria-hidden="true"
            className={styles.visuallyHidden}
          />

          {sample ? (
            <p className={styles.sampleStatus} aria-live="polite">
              Ready: <strong>{sample.name}</strong>{" "}
              <span className={styles.fileMeta}>
                ({fmtBytes(sample.sizeBytes)} ·{" "}
                {sample.source === "recording" ? "recorded" : "uploaded"})
              </span>
            </p>
          ) : null}
        </>
      ) : (
        <div className={styles.field}>
          <span className={styles.label}>Pick a premium voice</span>
          <input
            type="hidden"
            name="premium_voice_id"
            value={premiumId}
          />
          <div className={styles.channelGrid} role="radiogroup">
            {premiumVoices.map((voice) => {
              const selected = premiumId === voice.id;
              return (
                <label
                  key={voice.id}
                  className={`${styles.channelOption} ${
                    selected ? styles.channelOptionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="premium_voice_pick"
                    value={voice.id}
                    checked={selected}
                    onChange={() => handlePremiumPick(voice)}
                    className={styles.channelCheck}
                  />
                  <span>
                    <span className={styles.channelLabel}>{voice.name}</span>
                    <span className={styles.channelMeta}>{voice.vibe}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <span className={styles.hint}>
            These are stock ElevenLabs voices — same engine, none of the
            recording.
          </span>
        </div>
      )}

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <SubmitButton mode={mode} disabled={!ready} />
        <span className={styles.hint}>
          {mode === "clone"
            ? "We send the file straight to ElevenLabs and store only the voice ID."
            : "No upload needed — we just save your pick and move on."}
        </span>
      </div>
    </form>
  );
}

function SubmitButton({ mode, disabled }: { mode: Mode; disabled: boolean }) {
  const { pending } = useFormStatus();
  const idleLabel = mode === "clone" ? "Clone my voice" : "Use this voice";
  const pendingLabel = mode === "clone" ? "Cloning…" : "Saving…";
  return (
    <button
      type="submit"
      className={styles.btnPrimary}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
