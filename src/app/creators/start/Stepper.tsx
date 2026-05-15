import type { WizardStep } from "@/lib/creator-state";
import styles from "./wizard.module.css";

const ORDER: { id: WizardStep; label: string }[] = [
  { id: "voice", label: "Clone your voice" },
  { id: "feed", label: "Connect your Substack" },
  { id: "channels", label: "Pick your channels" },
  { id: "done", label: "All set" },
];

export function Stepper({
  active,
  completed,
}: {
  active: WizardStep;
  completed: Set<WizardStep>;
}) {
  const activeIdx = ORDER.findIndex((s) => s.id === active);
  return (
    <ol className={styles.stepper} aria-label="Setup progress">
      {ORDER.map((step, idx) => {
        const isActive = idx === activeIdx;
        const isDone = completed.has(step.id) && !isActive;
        const cls = [
          styles.stepperItem,
          isActive && styles.stepperItemActive,
          isDone && styles.stepperItemDone,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <li
            key={step.id}
            className={cls}
            aria-current={isActive ? "step" : undefined}
          >
            <span className={styles.stepperIndex}>
              {isDone ? "Done" : `Step ${idx + 1}`}
            </span>
            <span className={styles.stepperLabel}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
