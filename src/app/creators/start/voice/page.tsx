import { readCreatorState } from "@/lib/creator-state";
import { Stepper } from "../Stepper";
import styles from "../wizard.module.css";
import { VoiceForm } from "./VoiceForm";

export default async function VoicePage() {
  const state = await readCreatorState();
  const completed = new Set<"voice" | "feed" | "channels" | "done">();
  if (state?.voice) completed.add("voice");
  if (state?.substack) completed.add("feed");
  if (state?.channels?.length) completed.add("channels");

  const hasKey = Boolean(process.env.ELEVENLABS_API_KEY);

  return (
    <>
      <header>
        <div className={styles.eyebrow}>Step 1 of 3</div>
        <h1 className={styles.heading}>Clone the voice that reads your show.</h1>
        <p className={styles.lead}>
          Upload a short sample of you reading any text. ElevenLabs builds a
          private voice model — only you and ClawCast can use it.
        </p>
      </header>

      <Stepper active="voice" completed={completed} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Your voice sample</h2>
        <p className={styles.cardBody}>
          Aim for 1–5 minutes. A quiet room, your normal phone mic, and
          conversational pacing produce the best clone.
        </p>

        {!hasKey ? (
          <p className={styles.notice}>
            Dev preview: <code>ELEVENLABS_API_KEY</code> isn&rsquo;t set in this
            environment, so we&rsquo;ll mint a placeholder voice ID instead of
            actually cloning. Wire the key up in <code>.env.local</code> for the
            real flow.
          </p>
        ) : null}

        {state?.voice ? (
          <p className={styles.notice}>
            We already have a clone on file ({state.voice.name}). Submitting
            again will replace it.
          </p>
        ) : null}

        <VoiceForm defaultName={state?.voice?.name} />
      </section>
    </>
  );
}
