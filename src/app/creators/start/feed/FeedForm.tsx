"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitSubstackFeed, type ActionResult } from "../actions";
import styles from "../wizard.module.css";

const initial: ActionResult = {};

export function FeedForm({ defaultUrl }: { defaultUrl?: string }) {
  const [state, formAction] = useActionState(submitSubstackFeed, initial);

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="substack-url" className={styles.label}>
          Substack URL
        </label>
        <input
          id="substack-url"
          name="url"
          type="text"
          required
          defaultValue={defaultUrl}
          placeholder="https://yourname.substack.com"
          className={styles.input}
          autoComplete="url"
          inputMode="url"
        />
        <span className={styles.hint}>
          We&rsquo;ll look up <code>/feed</code> on whatever URL you paste —
          works for substack.com, custom domains, or Ghost feeds.
        </span>
      </div>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.btnPrimary} disabled={pending}>
      {pending ? "Checking feed…" : "Connect feed"}
    </button>
  );
}
