"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitVoiceClone, type ActionResult } from "../actions";
import styles from "../wizard.module.css";

const initial: ActionResult = {};

export function VoiceForm({ defaultName }: { defaultName?: string }) {
  const [state, formAction] = useActionState(submitVoiceClone, initial);

  return (
    <form action={formAction} className={styles.form}>
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
          defaultValue={defaultName}
          placeholder="e.g. Maya Patel"
          className={styles.input}
        />
        <span className={styles.hint}>
          Just for your dashboard — listeners never see this label.
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="voice-sample" className={styles.label}>
          Voice sample
        </label>
        <input
          id="voice-sample"
          name="sample"
          type="file"
          accept="audio/*"
          required
          className={styles.input}
        />
        <span className={styles.hint}>
          1–5 minutes of you reading any text, in a quiet room. MP3, WAV, or
          M4A. Max 14MB.
        </span>
      </div>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <SubmitButton />
        <span className={styles.hint}>
          We send the file straight to ElevenLabs and store only the voice ID.
        </span>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.btnPrimary} disabled={pending}>
      {pending ? "Cloning…" : "Clone my voice"}
    </button>
  );
}
