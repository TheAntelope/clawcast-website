// One-creator polling orchestrator. Called by the cron route handler for
// each active creator on each tick. Cookie-free — runs entirely from the
// persisted CreatorRecord.

import {
  recordEpisode,
  type CreatorRecord,
} from "@/lib/creators-store";
import { synthesize } from "@/lib/elevenlabs";
import { saveEpisode, slugify } from "@/lib/episodes";
import {
  fetchLatestPosts,
  truncateForEpisode,
} from "@/lib/substack-posts";

export type PollOutcome =
  | { kind: "rendered"; title: string; slug: string; truncated: boolean }
  | { kind: "skipped-up-to-date" }
  | { kind: "skipped-no-posts" }
  | { kind: "error"; error: string };

// Cost guardrail: at most this many new posts per creator per cron tick. If a
// creator's been quiet and then publishes 5 posts in an hour, we render the
// most recent few and pick up the rest on subsequent ticks.
const MAX_NEW_EPISODES_PER_RUN = 1;

export async function pollCreator(
  record: CreatorRecord,
): Promise<PollOutcome[]> {
  const fetched = await fetchLatestPosts(record.substack.feed, 10);
  if (!fetched.ok) {
    return [{ kind: "error", error: fetched.error }];
  }
  if (fetched.posts.length === 0) {
    return [{ kind: "skipped-no-posts" }];
  }

  const known = new Set(record.episodes.map((e) => e.guid));
  const fresh = fetched.posts.filter((p) => !known.has(p.guid));
  if (fresh.length === 0) {
    return [{ kind: "skipped-up-to-date" }];
  }

  // Newest-first by pubDate.
  fresh.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
  const queue = fresh.slice(0, MAX_NEW_EPISODES_PER_RUN);

  const outcomes: PollOutcome[] = [];
  for (const post of queue) {
    if (!post.text.trim()) {
      outcomes.push({
        kind: "error",
        error: `Post "${post.title}" has no narratable text.`,
      });
      continue;
    }

    const { text: narration, truncated } = truncateForEpisode(post.text);
    const audio = await synthesize({
      voiceId: record.voice.id,
      text: narration,
    });
    if (!audio.ok) {
      outcomes.push({ kind: "error", error: audio.error });
      continue;
    }

    const slug = slugify(post.title, post.guid);
    const description =
      post.excerpt + (truncated ? " (first ~5 minutes)" : "");

    const saved = await saveEpisode({
      slug,
      title: post.title,
      description,
      pubDate: post.pubDate,
      sourcePostUrl: post.link,
      sourcePostGuid: post.guid,
      voiceId: record.voice.id,
      voiceName: record.voice.name,
      audio: audio.audio,
    });
    if (!saved.ok) {
      outcomes.push({ kind: "error", error: saved.error });
      continue;
    }

    const recorded = await recordEpisode(record.id, {
      guid: post.guid,
      slug,
      renderedAt: new Date().toISOString(),
    });
    if (!recorded.ok) {
      outcomes.push({ kind: "error", error: recorded.error });
      continue;
    }

    outcomes.push({
      kind: "rendered",
      title: post.title,
      slug,
      truncated,
    });
  }

  return outcomes;
}
