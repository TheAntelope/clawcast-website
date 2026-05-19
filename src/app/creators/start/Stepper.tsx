import Link from "next/link";
import type { WizardStep } from "@/lib/creator-state";
import styles from "./wizard.module.css";

const ORDER: { id: WizardStep; label: string; href: string }[] = [
  { id: "voice", label: "Clone your voice", href: "/creators/start/voice" },
  { id: "feed", label: "Connect your Substack", href: "/creators/start/feed" },
  {
    id: "channels",
    label: "Pick your channels",
    href: "/creators/start/channels",
  },
  { id: "done", label: "All set", href: "/creators/start/done" },
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
        const inner = (
          <>
            <span className={styles.stepperIndex}>
              {isDone ? "Done" : `Step ${idx + 1}`}
            </span>
            <span className={styles.stepperLabel}>{step.label}</span>
          </>
        );
        return (
          <li
            key={step.id}
            className={cls}
            aria-current={isActive ? "step" : undefined}
          >
            {isDone ? (
              <Link href={step.href} className={styles.stepperItemLink}>
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}
