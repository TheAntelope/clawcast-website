import { readCreatorState } from "@/lib/creator-state";
import { PREMIUM_VOICES } from "@/lib/elevenlabs";
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
        <h1 className={styles.heading}>Pick the voice that reads your show.</h1>
        <p className={styles.lead}>
          Clone your own voice in the browser, or skip the recording and use
          one of our premium ElevenLabs voices.
        </p>
      </header>

      <Stepper active="voice" completed={completed} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Your voice</h2>
        <p className={styles.cardBody}>
          Cloning takes about two minutes of you reading the script — quiet
          room, normal speaking voice. Premium voices skip all that and ship
          straight into the wizard.
        </p>

        {!hasKey ? (
          <p className={styles.notice}>
            Dev preview: <code>ELEVENLABS_API_KEY</code> isn&rsquo;t set in this
            environment, so cloning will mint a placeholder ID. Premium voices
            still work — they&rsquo;re just preset IDs. Wire the key up in{" "}
            <code>.env.local</code> for the real cloning flow.
          </p>
        ) : null}

        {state?.voice ? (
          <p className={styles.notice}>
            We already have a voice on file ({state.voice.name}). Submitting
            again will replace it.
          </p>
        ) : null}

        <VoiceForm
          defaultName={state?.voice?.name}
          premiumVoices={PREMIUM_VOICES}
        />
      </section>
    </>
  );
}
