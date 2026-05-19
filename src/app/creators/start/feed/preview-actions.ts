"use server";

import { readCreatorState, writeCreatorState } from "@/lib/creator-state";
import { recordEpisode } from "@/lib/creators-store";
import { synthesize } from "@/lib/elevenlabs";
import { saveEpisode, slugify, type EpisodeMeta } from "@/lib/episodes";
import {
  fetchLatestPosts,
  truncateForEpisode,
  type SubstackPost,
} from "@/lib/substack-posts";

export type PreviewResult =
  | { ok: true; posts: SubstackPost[] }
  | { ok: false; error: string };

export type GenerateResult =
  | { ok: true; episode: EpisodeMeta; truncated: boolean }
  | { ok: false; error: string };

export async function loadLatestPost(): Promise<PreviewResult> {
  const state = await readCreatorState();
  if (!state?.substack) {
    return { ok: false, error: "Save your Substack feed first." };
  }
  return fetchLatestPosts(state.substack.feed, 3);
}

export async function generateEpisode(guid: string): Promise<GenerateResult> {
  const state = await readCreatorState();
  if (!state?.voice) {
    return { ok: false, error: "Pick a voice in step 1 first." };
  }
  if (!state.substack) {
    return { ok: false, error: "Save your Substack feed first." };
  }

  const posts = await fetchLatestPosts(state.substack.feed, 10);
  if (!posts.ok) return { ok: false, error: posts.error };

  const post = posts.posts.find((p) => p.guid === guid) ?? posts.posts[0];
  if (!post) return { ok: false, error: "Couldn't find that post." };

  if (!post.text.trim()) {
    return { ok: false, error: "That post has no narratable text." };
  }

  const { text: narration, truncated } = truncateForEpisode(post.text);

  const audio = await synthesize({
    voiceId: state.voice.id,
    text: narration,
  });
  if (!audio.ok) return { ok: false, error: audio.error };

  const slug = slugify(post.title, post.guid);
  const description = post.excerpt + (truncated ? " (first ~5 minutes)" : "");

  const saved = await saveEpisode({
    slug,
    title: post.title,
    description,
    pubDate: post.pubDate,
    sourcePostUrl: post.link,
    sourcePostGuid: post.guid,
    voiceId: state.voice.id,
    voiceName: state.voice.name,
    audio: audio.audio,
  });
  if (!saved.ok) return { ok: false, error: saved.error };

  if (!state.substack.firstEpisodeAt) {
    await writeCreatorState({
      ...state,
      substack: { ...state.substack, firstEpisodeAt: new Date().toISOString() },
    });
  }

  // Best-effort: if the creator has already finished the wizard (record
  // exists in Blob), append this episode to their persisted record so the
  // cron poller treats it as already-rendered. Pre-wizard-completion renders
  // get back-filled by submitChannels via hostname match.
  await recordEpisode(state.id, {
    guid: post.guid,
    slug,
    renderedAt: new Date().toISOString(),
  });

  return { ok: true, episode: saved.episode, truncated };
}
