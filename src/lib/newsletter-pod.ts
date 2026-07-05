// Typed client for the Newsletter-pod broadcast-loop endpoints.
//
// All calls are server-side only: they read the job-trigger token from
// process.env, which is never exposed to the browser. Wraps the endpoints
// shipped in Newsletter-pod PRs #16/17/18.

// Most calls (list / get loop / paste-feedback) complete in under a second.
// runLoop is the outlier — it drives a 60-100s pipeline (LLM + TTS + ffmpeg
// + X media upload). Vercel server functions allow up to 5 minutes; align
// the client to 4 minutes so we abort before Vercel kills the function.
const DEFAULT_TIMEOUT_MS = 240_000;

export type BroadcastLoop = {
  loop_id: string;
  region: string;
  timezone: string;
  audience_persona: string;
  post_local_time: string;
  seed_topics: string[];
  active: boolean;
  feedback_prompt_text: string | null;
  source_ids: string[];
  created_at: string;
  updated_at: string;
};

export type SourceCatalogEntry = {
  source_id: string;
  name: string;
  rss_url: string;
  enabled: boolean;
  topic: string | null;
};

export type BroadcastEpisode = {
  episode_id: string;
  loop_id: string;
  run_date: string;
  topic_used: string;
  title: string;
  show_notes: string;
  audio_object_name: string;
  video_object_name: string;
  episode_tweet_id: string | null;
  episode_tweet_url: string | null;
  feedback_prompt_tweet_id: string | null;
  feedback_prompt_tweet_url: string | null;
  feedback_summary: string | null;
  feedback_raw: string | null;
  feedback_pasted_at: string | null;
  created_at: string;
};

export type UpsertLoopInput = {
  loop_id: string;
  region: string;
  timezone: string;
  audience_persona: string;
  post_local_time: string;
  seed_topics: string[];
  active: boolean;
  feedback_prompt_text: string | null;
  source_ids: string[];
};

export type RunLoopResult = {
  loop_id: string;
  episode_id?: string;
  topic?: string;
  run_date?: string;
  audio_url?: string;
  video_url?: string;
  episode_tweet_id?: string | null;
  episode_tweet_url?: string | null;
  feedback_prompt_tweet_id?: string | null;
  feedback_prompt_tweet_url?: string | null;
  status?: "skipped";
  reason?: string;
};

export type PasteFeedbackResult = {
  episode_id: string;
  feedback_summary: string | null;
  feedback_summary_status: "summarized" | "summarizer_unavailable" | "no_useful_content";
};

export class NewsletterPodConfigError extends Error {}
export class NewsletterPodApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function readConfig(): { baseUrl: string; token: string } {
  const baseUrl = process.env.NEWSLETTER_POD_URL;
  const token = process.env.NEWSLETTER_POD_JOB_TRIGGER_TOKEN;
  if (!baseUrl || !token) {
    throw new NewsletterPodConfigError(
      "NEWSLETTER_POD_URL and NEWSLETTER_POD_JOB_TRIGGER_TOKEN must both be set",
    );
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

async function call<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const { baseUrl, token } = readConfig();
  const url = `${baseUrl}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "X-Job-Trigger-Token": token,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      // Admin pages are always reading the live state — never cache.
      cache: "no-store",
    });
    let data: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      throw new NewsletterPodApiError(
        `Newsletter-pod ${method} ${path} returned ${response.status}`,
        response.status,
        data,
      );
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function listLoops(activeOnly = false): Promise<BroadcastLoop[]> {
  const result = await call<{ loops: BroadcastLoop[] }>(
    "GET",
    `/jobs/broadcast/loops${activeOnly ? "?active_only=true" : ""}`,
  );
  return result.loops;
}

export async function listSourceCatalog(): Promise<SourceCatalogEntry[]> {
  // /v1/sources/catalog is publicly readable on Newsletter-pod (no auth
  // gate). We still go through `call` so it picks up the same baseUrl
  // resolution + timeout + error shape as the rest of the client; the
  // X-Job-Trigger-Token header is sent but ignored on this path.
  const result = await call<{ sources: SourceCatalogEntry[] }>(
    "GET",
    "/v1/sources/catalog",
  );
  return result.sources;
}

export async function getLoop(loopId: string): Promise<BroadcastLoop | null> {
  try {
    return await call<BroadcastLoop>("GET", `/jobs/broadcast/loops/${encodeURIComponent(loopId)}`);
  } catch (err) {
    if (err instanceof NewsletterPodApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function upsertLoop(input: UpsertLoopInput): Promise<BroadcastLoop> {
  return call<BroadcastLoop>("POST", "/jobs/broadcast/loops", input);
}

export async function deleteLoop(loopId: string): Promise<{ loop_id: string; deleted: boolean }> {
  return call("DELETE", `/jobs/broadcast/loops/${encodeURIComponent(loopId)}`);
}

export async function listLoopEpisodes(loopId: string, limit = 20): Promise<BroadcastEpisode[]> {
  const result = await call<{ loop_id: string; episodes: BroadcastEpisode[] }>(
    "GET",
    `/jobs/broadcast/loops/${encodeURIComponent(loopId)}/episodes?limit=${limit}`,
  );
  return result.episodes;
}

export async function runLoop(
  loopId: string,
  opts?: { tweet_text_override?: string; feedback_prompt_override?: string },
): Promise<RunLoopResult> {
  return call<RunLoopResult>(
    "POST",
    `/jobs/broadcast/loops/${encodeURIComponent(loopId)}/run`,
    { loop_id: loopId, ...opts },
  );
}

export async function pasteFeedback(
  episodeId: string,
  feedbackText: string,
): Promise<PasteFeedbackResult> {
  return call<PasteFeedbackResult>(
    "POST",
    `/jobs/broadcast/episodes/${encodeURIComponent(episodeId)}/feedback`,
    { feedback_text: feedbackText },
  );
}

// --- Podcast Shaping Studio (show blueprint) --------------------------------

export type BlueprintDetailLevel = "headline" | "shallow" | "standard" | "deep";

export type BlueprintSection = {
  kind: string;
  enabled: boolean;
  detail_level: BlueprintDetailLevel;
  target_words: number | null;
  instructions: string | null;
  max_blocks: number | null;
};

export type ShowBlueprint = {
  sections: BlueprintSection[];
  opening: {
    intro_music_enabled: boolean;
    intro_music_asset: string | null;
  };
  style: {
    banned_phrases: string[];
    positive_guidance: string | null;
    lint_enabled: boolean;
    max_rewrite_segments: number;
  };
  predictions: {
    enabled: boolean;
    max_mentions: number;
    min_relevance: number;
  };
  music: {
    outro_music_enabled: boolean;
    outro_music_asset: string | null;
    music_gain_db: number;
    intro_bed_seconds: number;
    fade_ms: number;
  };
  closing: {
    announcements_text: string | null;
    signoff_override: string | null;
  };
};

export type BlueprintVersion = {
  version: number;
  blueprint: ShowBlueprint;
  updated_at: string | null;
  updated_by: string | null;
  note: string | null;
  is_default?: boolean;
};

export async function getBlueprint(): Promise<BlueprintVersion> {
  return call<BlueprintVersion>("GET", "/jobs/config");
}

export async function putBlueprint(
  blueprint: ShowBlueprint,
  note?: string | null,
): Promise<BlueprintVersion> {
  return call<BlueprintVersion>("PUT", "/jobs/config", {
    blueprint,
    note: note ?? null,
  });
}

export async function listBlueprintHistory(limit = 50): Promise<BlueprintVersion[]> {
  const result = await call<{ versions: BlueprintVersion[] }>(
    "GET",
    `/jobs/config/history?limit=${limit}`,
  );
  return result.versions;
}

export async function restoreBlueprint(version: number): Promise<BlueprintVersion> {
  return call<BlueprintVersion>("POST", "/jobs/config/restore", { version });
}

export type BlueprintPreview = {
  episode_title: string;
  transcript: string | null;
  show_notes: string;
  duration_seconds: number | null;
  section_order: string[];
  lint_hits: { segment_index: number; matched: string[] }[];
  market_hints: string[];
  text_only: boolean;
};

export async function previewBlueprint(
  blueprint: ShowBlueprint,
  textOnly = true,
): Promise<BlueprintPreview> {
  return call<BlueprintPreview>(
    "POST",
    `/jobs/config/preview?text_only=${textOnly ? "true" : "false"}`,
    { blueprint },
  );
}

export type PodRun = {
  id?: string;
  status?: string;
  message?: string | null;
  published_episode_id?: string | null;
  [key: string]: unknown;
};

export type StartPodResult = {
  user_id: string;
  run: PodRun;
  started: boolean;
};

export type PodStatusResult = {
  run: PodRun;
  episode?: { id?: string; title?: string };
  feed_url?: string;
};

// Async, timeout-proof: start the real generation and return a run_id
// immediately, then poll getUserPodStatus. A synchronous 1-2 min generation
// through a serverless function times out ("status unknown"); this doesn't.
export async function startUserPod(opts: {
  userId?: string;
  email?: string;
  force?: boolean;
}): Promise<StartPodResult> {
  return call<StartPodResult>("POST", "/jobs/generate-user/start", {
    user_id: opts.userId || null,
    email: opts.email || null,
    force: opts.force ?? true,
  });
}

export async function getUserPodStatus(
  userId: string,
  runId: string,
): Promise<PodStatusResult> {
  return call<PodStatusResult>(
    "GET",
    `/jobs/generate-user/status?user_id=${encodeURIComponent(userId)}&run_id=${encodeURIComponent(runId)}`,
  );
}

export type LatestPodResult = {
  episode: {
    id?: string;
    title?: string;
    published_at?: string;
    duration_seconds?: number | null;
  } | null;
  feed_url?: string | null;
};

// The account's most recent already-published pod — used as a fallback to play
// when a fresh generation has no new content.
export async function getLatestUserPod(userId: string): Promise<LatestPodResult> {
  return call<LatestPodResult>(
    "GET",
    `/jobs/generate-user/latest?user_id=${encodeURIComponent(userId)}`,
  );
}
