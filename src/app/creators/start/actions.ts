"use server";

import { redirect } from "next/navigation";
import {
  clearCreatorState,
  ensureCreatorState,
  writeCreatorState,
} from "@/lib/creator-state";
import { cloneVoice } from "@/lib/elevenlabs";
import { resolveSubstackFeed } from "@/lib/substack";

export type ActionResult = { error?: string };

const SHARED_SPOTIFY_CHANNEL = "spotify-shared";

export async function submitVoiceClone(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const sample = formData.get("sample");

  if (!name) return { error: "Add a display name for your voice." };
  if (!(sample instanceof File) || sample.size === 0) {
    return { error: "Pick an audio file to clone from." };
  }
  if (sample.size > 14 * 1024 * 1024) {
    return { error: "That file is over 14MB — try a shorter sample." };
  }

  const result = await cloneVoice({
    name,
    description: `ClawCast creator clone for ${name}`,
    sample,
  });

  if (!result.ok) return { error: result.error };

  const state = await ensureCreatorState();
  await writeCreatorState({
    ...state,
    voice: { id: result.voiceId, name: result.name, mock: result.mock },
  });

  redirect("/creators/start/feed");
}

export async function submitSubstackFeed(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const url = String(formData.get("url") ?? "");
  const result = await resolveSubstackFeed(url);
  if (!result.ok) return { error: result.error };

  const state = await ensureCreatorState();
  if (!state.voice) redirect("/creators/start/voice");

  await writeCreatorState({
    ...state,
    substack: { url: result.url, feed: result.feed, title: result.title },
  });

  redirect("/creators/start/channels");
}

export async function submitChannels(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const channels = formData.getAll("channel").map(String);
  if (!channels.includes(SHARED_SPOTIFY_CHANNEL)) {
    return {
      error:
        "Pick at least one channel — Spotify is the only one live in the pilot.",
    };
  }

  const state = await ensureCreatorState();
  if (!state.voice) redirect("/creators/start/voice");
  if (!state.substack) redirect("/creators/start/feed");

  await writeCreatorState({ ...state, channels });
  redirect("/creators/start/done");
}

export async function resetWizard(): Promise<void> {
  await clearCreatorState();
  redirect("/creators/start/voice");
}
