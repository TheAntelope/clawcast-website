import { redirect } from "next/navigation";
import { readCreatorState } from "@/lib/creator-state";
import { Stepper } from "../Stepper";
import styles from "../wizard.module.css";
import { FeedForm } from "./FeedForm";
import { PreviewLatest } from "./PreviewLatest";

export default async function FeedPage() {
  const state = await readCreatorState();
  if (!state?.voice) redirect("/creators/start/voice");

  const completed = new Set<"voice" | "feed" | "channels" | "done">(["voice"]);
  if (state.substack) completed.add("feed");
  if (state.channels?.length) completed.add("channels");

  return (
    <>
      <header>
        <div className={styles.eyebrow}>Step 2 of 3</div>
        <h1 className={styles.heading}>Point ClawCast at your newsletter.</h1>
        <p className={styles.lead}>
          Paste the URL of your Substack (or any RSS feed). ClawCast checks for
          new posts every few hours and renders each one in your cloned voice.
        </p>
      </header>

      <Stepper active="feed" completed={completed} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Substack feed</h2>
        <p className={styles.cardBody}>
          Already have a feed connected? Paste a new URL to switch — only one
          publication per creator during the pilot.
        </p>

        {state.substack ? (
          <p className={styles.notice}>
            Currently following:{" "}
            <strong>{state.substack.title ?? state.substack.url}</strong>{" "}
            <span className={styles.code}>({state.substack.feed})</span>
          </p>
        ) : null}

        <FeedForm defaultUrl={state.substack?.url} />
      </section>

      {state.substack && state.voice ? (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Try it on your latest post</h2>
          <p className={styles.cardBody}>
            Before you wait for the next newsletter, let&rsquo;s render the most
            recent post into an episode. It lands in our feed at{" "}
            <code>/podcast.xml</code> — the same URL we&rsquo;ll submit to
            Spotify once the ClawCast show is set up.
          </p>
          <PreviewLatest
            feedTitle={state.substack.title ?? state.substack.url}
            voiceName={state.voice.name}
            autoStart={!state.substack.firstEpisodeAt}
          />
        </section>
      ) : null}
    </>
  );
}
