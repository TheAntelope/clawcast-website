"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitChannels, type ActionResult } from "../actions";
import styles from "../wizard.module.css";

const initial: ActionResult = {};

export type ChannelOption = {
  id: string;
  label: string;
  meta: string;
  available: boolean;
};

export function ChannelsForm({
  options,
  defaultSelected,
}: {
  options: ChannelOption[];
  defaultSelected: string[];
}) {
  const [state, formAction] = useActionState(submitChannels, initial);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultSelected),
  );

  function toggle(id: string, available: boolean) {
    if (!available) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.channelGrid}>
        {options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const cls = [
            styles.channelOption,
            isSelected && styles.channelOptionSelected,
            !opt.available && styles.channelDisabled,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <label key={opt.id} className={cls}>
              <input
                type="checkbox"
                name="channel"
                value={opt.id}
                className={styles.channelCheck}
                checked={isSelected}
                disabled={!opt.available}
                onChange={() => toggle(opt.id, opt.available)}
              />
              <span>
                <span className={styles.channelLabel}>{opt.label}</span>
                <span className={styles.channelMeta}>{opt.meta}</span>
              </span>
            </label>
          );
        })}
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
      {pending ? "Saving…" : "Finish setup"}
    </button>
  );
}
