// The public "daily show" demo — the short episode ClawCast generates every
// morning and posts to X. We pull the latest item from its RSS feed at request
// time (cached, revalidated periodically) so the homepage can play it.
//
// Resilience is the whole point here: a dead or slow feed must never break the
// page. Every failure path returns null, and the UI hides the player cleanly
// when that happens.

// TODO: set the public RSS feed URL of the daily demo show (the same episodes
// posted to X). While empty, getLatestDailyEpisode() returns null and the
// "Today's episode" module degrades to a follow-on-X prompt.
export const DAILY_SHOW_FEED_URL = "";

// TODO: one-line description of what the daily show is built from, e.g.
// "public tech and business feeds". While empty, the copy omits the
// "built from …" clause rather than inventing sources.
export const DAILY_SHOW_SOURCES = "";

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
  if (!DAILY_SHOW_FEED_URL) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(DAILY_SHOW_FEED_URL, {
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
