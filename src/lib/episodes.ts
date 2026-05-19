// Stores rendered podcast episodes in Vercel Blob and reads them back for the
// RSS feed. Each episode is two objects under `episodes/`: an MP3 and a JSON
// sidecar with the metadata we need to assemble the feed.
//
// Authentication: @vercel/blob picks up BLOB_READ_WRITE_TOKEN from the env.
// In dev, run `vercel link` and `vercel env pull .env.local` to get one.

import { list, put } from "@vercel/blob";

export type EpisodeMeta = {
  slug: string;
  title: string;
  description: string;
  audioUrl: string;
  audioBytes: number;
  durationSeconds: number;
  pubDate: string; // ISO 8601
  sourcePostUrl: string;
  sourcePostGuid: string;
  voiceId: string;
  voiceName: string;
};

export type SaveResult =
  | { ok: true; episode: EpisodeMeta }
  | { ok: false; error: string };

const PREFIX = "episodes/";
const AUDIO_BITRATE_BPS = 128_000; // ElevenLabs default MP3 output

export async function saveEpisode(opts: {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  sourcePostUrl: string;
  sourcePostGuid: string;
  voiceId: string;
  voiceName: string;
  audio: ArrayBuffer;
}): Promise<SaveResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      error:
        "BLOB_READ_WRITE_TOKEN isn't set. Run `vercel link` + `vercel env pull .env.local`, then restart the dev server.",
    };
  }

  const audioBytes = opts.audio.byteLength;
  const durationSeconds = Math.max(
    1,
    Math.round((audioBytes * 8) / AUDIO_BITRATE_BPS),
  );

  let audioBlob;
  try {
    audioBlob = await put(`${PREFIX}${opts.slug}.mp3`, opts.audio, {
      access: "public",
      contentType: "audio/mpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    return { ok: false, error: `Blob upload failed: ${(err as Error).message}` };
  }

  const meta: EpisodeMeta = {
    slug: opts.slug,
    title: opts.title,
    description: opts.description,
    audioUrl: audioBlob.url,
    audioBytes,
    durationSeconds,
    pubDate: opts.pubDate,
    sourcePostUrl: opts.sourcePostUrl,
    sourcePostGuid: opts.sourcePostGuid,
    voiceId: opts.voiceId,
    voiceName: opts.voiceName,
  };

  try {
    await put(`${PREFIX}${opts.slug}.json`, JSON.stringify(meta, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    return {
      ok: false,
      error: `Metadata upload failed: ${(err as Error).message}`,
    };
  }

  return { ok: true, episode: meta };
}

export async function listEpisodes(): Promise<EpisodeMeta[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const { blobs } = await list({ prefix: PREFIX });
  const metas = await Promise.all(
    blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .map(async (b) => {
        try {
          const res = await fetch(b.url, { cache: "no-store" });
          if (!res.ok) return null;
          return (await res.json()) as EpisodeMeta;
        } catch {
          return null;
        }
      }),
  );

  return metas
    .filter((m): m is EpisodeMeta => m !== null)
    .sort((a, b) => b.pubDate.localeCompare(a.pubDate));
}

// Builds a URL-safe slug. We intentionally keep it deterministic (no random
// suffix) so re-running on the same post overwrites the previous episode
// rather than piling duplicates into the feed.
export function slugify(title: string, guid: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const fingerprint = hash32(guid).toString(16).padStart(8, "0");
  const safeBase = base || "episode";
  return `${safeBase}-${fingerprint}`;
}

function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
