// The public "daily show" demo — the short episode ClawCast generates every
// morning and posts to X. The Newsletter-pod backend serves it as a public
// podcast feed at `${NEWSLETTER_POD_URL}/broadcast/<loop_id>/feed.xml`; we pull
// the latest item at request time (cached, revalidated periodically) so the
// homepage can play it.
//
// Resilience is the whole point here: a dead or slow feed must never break the
// page. Every failure path returns null, and the UI hides the player cleanly
// when that happens.

// The broadcast loop_id whose episodes are the public daily show (the loop we
// run for the X posts).
export const DAILY_SHOW_LOOP_ID = "eu-morning";

// Optional hard override. Leave empty to derive the feed URL from
// NEWSLETTER_POD_URL + DAILY_SHOW_LOOP_ID (the normal path); set it only to
// point at a feed hosted somewhere else.
export const DAILY_SHOW_FEED_URL = "";

// One-line description of what the daily show is built from. Fills the copy
// "ClawCast generates this short show every morning from ___."
export const DAILY_SHOW_SOURCES = "its own curated feeds";

// Resolves the feed URL: an explicit override wins; otherwise build it from the
// backend base URL (same env var the admin pages use) and the loop_id. Returns
// null when neither path is configured, so the module degrades cleanly.
function resolveFeedUrl(): string | null {
  if (DAILY_SHOW_FEED_URL) return DAILY_SHOW_FEED_URL;
  const base = process.env.NEWSLETTER_POD_URL?.replace(/\/$/, "");
  if (!base || !DAILY_SHOW_LOOP_ID) return null;
  return `${base}/broadcast/${encodeURIComponent(DAILY_SHOW_LOOP_ID)}/feed.xml`;
}

// TODO (optional): subscribe links for the daily show itself (Apple Podcasts /
// Spotify). Leave empty to show only the "follow along on X" link.
export const DAILY_SHOW_SUBSCRIBE_LINKS: { label: string; href: string }[] = [];

export type DailyEpisode = {
  title: string;
  pubDate: string; // ISO 8601, or "" if the feed omitted it
  audioUrl: string;
};

const FETCH_TIMEOUT_MS = 5000;
const REVALIDATE_SECONDS = 1800; // 30 minutes

// Fetches and returns the most recent episode from the daily show feed, or null
// if the feed is unset, unreachable, slow, or unparseable.
export async function getLatestDailyEpisode(): Promise<DailyEpisode | null> {
  const feedUrl = resolveFeedUrl();
  if (!feedUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    return parseLatestItem(xml);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Minimal RSS parsing: grab the first <item>, then pull the title, pubDate, and
// enclosure URL out of it. We avoid a parser dependency on purpose — podcast
// feeds are predictable enough that a couple of regexes do the job, and any
// shape we don't recognise just falls through to null.
function parseLatestItem(xml: string): DailyEpisode | null {
  const item = xml.match(/<item[\s\S]*?<\/item>/i)?.[0];
  if (!item) return null;

  const audioUrl = item
    .match(/<enclosure\b[^>]*\burl\s*=\s*["']([^"']+)["']/i)?.[1]
    ?.trim();
  if (!audioUrl) return null;

  const title =
    extractTag(item, "title") || "Today's episode";
  const pubDateRaw = extractTag(item, "pubDate");
  const pubDate = pubDateRaw ? toIso(pubDateRaw) : "";

  return { title, pubDate, audioUrl };
}

function extractTag(scope: string, tag: string): string {
  const raw = scope.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1];
  if (!raw) return "";
  return decodeEntities(stripCdata(raw)).trim();
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function toIso(rfc822: string): string {
  const d = new Date(rfc822);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
