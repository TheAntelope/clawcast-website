// Persistent creator records in Vercel Blob. The wizard's cookie state is the
// editing buffer while a creator sets up; on finish we promote that state to
// a JSON record at `creators/{id}.json`. The cron poller reads these records
// because it runs without a user session.

import { list, put } from "@vercel/blob";

export type CreatorEpisodeRef = {
  guid: string; // Substack post guid
  slug: string; // matches the Blob path in episodes/{slug}.{mp3,json}
  renderedAt: string; // ISO 8601
};

export type CreatorRecord = {
  id: string;
  voice: {
    id: string;
    name: string;
    kind?: "clone" | "premium";
  };
  substack: {
    url: string;
    feed: string;
    title?: string;
  };
  channels: string[];
  episodes: CreatorEpisodeRef[];
  createdAt: string;
  updatedAt: string;
};

const PREFIX = "creators/";

export async function saveCreatorRecord(
  record: CreatorRecord,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      error: "BLOB_READ_WRITE_TOKEN isn't set — Blob storage is unavailable.",
    };
  }
  try {
    await put(`${PREFIX}${record.id}.json`, JSON.stringify(record, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: `Saving creator record failed: ${(err as Error).message}`,
    };
  }
}

export async function loadCreatorRecord(
  id: string,
): Promise<CreatorRecord | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const { blobs } = await list({ prefix: `${PREFIX}${id}.json` });
  const match = blobs.find((b) => b.pathname === `${PREFIX}${id}.json`);
  if (!match) return null;
  try {
    const res = await fetch(match.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CreatorRecord;
  } catch {
    return null;
  }
}

export async function listCreatorRecords(): Promise<CreatorRecord[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const { blobs } = await list({ prefix: PREFIX });
  const records = await Promise.all(
    blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .map(async (b) => {
        try {
          const res = await fetch(b.url, { cache: "no-store" });
          if (!res.ok) return null;
          return (await res.json()) as CreatorRecord;
        } catch {
          return null;
        }
      }),
  );
  return records.filter((r): r is CreatorRecord => r !== null);
}

// Idempotent: appends a new episode ref, or no-ops if the guid is already
// recorded. The cron uses guid to decide what's new, so this must stay
// duplicate-free.
export async function recordEpisode(
  creatorId: string,
  ref: CreatorEpisodeRef,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const record = await loadCreatorRecord(creatorId);
  if (!record) {
    return { ok: false, error: `No creator record for id ${creatorId}.` };
  }
  if (record.episodes.some((e) => e.guid === ref.guid)) {
    return { ok: true };
  }
  const updated: CreatorRecord = {
    ...record,
    episodes: [...record.episodes, ref],
    updatedAt: new Date().toISOString(),
  };
  return saveCreatorRecord(updated);
}
