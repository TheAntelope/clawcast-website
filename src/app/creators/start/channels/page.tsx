import { redirect } from "next/navigation";
import { readCreatorState } from "@/lib/creator-state";
import { Stepper } from "../Stepper";
import styles from "../wizard.module.css";
import { ChannelsForm, type ChannelOption } from "./ChannelsForm";

const CHANNELS: ChannelOption[] = [
  {
    id: "spotify-shared",
    label: "Spotify (shared ClawCast pilot account)",
    meta: "Live · episodes ship to a shared ClawCast Spotify show during the pilot",
    available: true,
  },
  {
    id: "apple-podcasts",
    label: "Apple Podcasts",
    meta: "Coming soon · private feed per creator",
    available: false,
  },
  {
    id: "spotify-own",
    label: "Your own Spotify show",
    meta: "Coming soon · we provision an RSS feed and you claim it in Spotify for Podcasters",
    available: false,
  },
  {
    id: "rss",
    label: "Standalone RSS feed",
    meta: "Coming soon · use it with Overcast, Pocket Casts, or anywhere else",
    available: false,
  },
];

export default async function ChannelsPage() {
  const state = await readCreatorState();
  if (!state?.voice) redirect("/creators/start/voice");
  if (!state.substack) redirect("/creators/start/feed");

  const completed = new Set<"voice" | "feed" | "channels" | "done">([
    "voice",
    "feed",
  ]);
  if (state.channels?.length) completed.add("channels");

  const defaultSelected =
    state.channels && state.channels.length > 0
      ? state.channels
      : ["spotify-shared"];

  return (
    <>
      <header>
        <div className={styles.eyebrow}>Step 3 of 3</div>
        <h1 className={styles.heading}>Pick where ClawCast publishes.</h1>
        <p className={styles.lead}>
          During the POC every creator&rsquo;s episodes ship to a single shared
          ClawCast Spotify show — easier to seed early listeners. Per-creator
          feeds are next on the list.
        </p>
      </header>

      <Stepper active="channels" completed={completed} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Channels</h2>
        <p className={styles.cardBody}>
          Spotify is the only channel live in the pilot. The rest are queued up
          and will turn on as we build them out.
        </p>
        <ChannelsForm
          options={CHANNELS}
          defaultSelected={defaultSelected}
        />
      </section>
    </>
  );
}
