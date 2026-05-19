"use server";

import { redirect } from "next/navigation";
import {
  clearCreatorState,
  ensureCreatorState,
  writeCreatorState,
} from "@/lib/creator-state";
import {
  loadCreatorRecord,
  saveCreatorRecord,
  type CreatorEpisodeRef,
  type CreatorRecord,
} from "@/lib/creators-store";
import { cloneVoice, findPremiumVoice } from "@/lib/elevenlabs";
import { listEpisodes } from "@/lib/episodes";
import { resolveSubstackFeed } from "@/lib/substack";

export type ActionResult = { error?: string };

const SHARED_SPOTIFY_CHANNEL = "spotify-shared";

export async function submitVoiceClone(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const mode = String(formData.get("mode") ?? "clone");

  if (!name) return { error: "Add a display name for your voice." };

  if (mode === "premium") {
    const premiumId = String(formData.get("premium_voice_id") ?? "");
    const voice = findPremiumVoice(premiumId);
    if (!voice) return { error: "Pick one of the premium voices to continue." };

    const state = await ensureCreatorState();
    await writeCreatorState({
      ...state,
      voice: { id: voice.id, name, kind: "premium" },
    });

    redirect("/creators/start/feed");
  }

  const sample = formData.get("sample");
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
    voice: {
      id: result.voiceId,
      name: result.name,
      mock: result.mock,
      kind: "clone",
    },
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

  // Reset firstEpisodeAt by writing a fresh substack object — the preview
  // card on the feed page auto-renders an episode for the new feed.
  await writeCreatorState({
    ...state,
    substack: { url: result.url, feed: result.feed, title: result.title },
  });

  return {};
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

  const promotion = await promoteToCreatorRecord({
    id: state.id,
    voice: state.voice,
    substack: state.substack,
    channels,
    createdAt: state.createdAt,
  });
  if (!promotion.ok) return { error: promotion.error };

  redirect("/creators/start/done");
}

// Promotes the wizard's cookie state to a persisted creator record so the
// cron poller can find it. Preserves any existing episodes (re-finishes are
// idempotent) and, on first promotion, back-fills episodes already rendered
// for this creator's Substack domain.
async function promoteToCreatorRecord(args: {
  id: string;
  voice: { id: string; name: string; kind?: "clone" | "premium" };
  substack: { url: string; feed: string; title?: string };
  channels: string[];
  createdAt: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date().toISOString();
  const existing = await loadCreatorRecord(args.id);

  let episodes: CreatorEpisodeRef[] = existing?.episodes ?? [];
  if (episodes.length === 0) {
    episodes = await backfillEpisodesForSubstack(args.substack.url);
  }

  const record: CreatorRecord = {
    id: args.id,
    voice: args.voice,
    substack: args.substack,
    channels: args.channels,
    episodes,
    createdAt: existing?.createdAt ?? args.createdAt,
    updatedAt: now,
  };
  return saveCreatorRecord(record);
}

async function backfillEpisodesForSubstack(
  substackUrl: string,
): Promise<CreatorEpisodeRef[]> {
  let host: string;
  try {
    host = new URL(substackUrl).hostname;
  } catch {
    return [];
  }
  const all = await listEpisodes();
  return all
    .filter((ep) => {
      try {
        return new URL(ep.sourcePostUrl).hostname === host;
      } catch {
        return false;
      }
    })
    .map((ep) => ({
      guid: ep.sourcePostGuid,
      slug: ep.slug,
      renderedAt: ep.pubDate,
    }));
}

export async function resetWizard(): Promise<void> {
  await clearCreatorState();
  redirect("/creators/start/voice");
}
