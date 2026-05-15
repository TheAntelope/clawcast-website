// Resolves a Substack publication URL to its RSS feed and (best-effort) title.
// Substack feeds live at <publication>/feed for every newsletter, and the
// HTML <title> on the publication root gives us a friendly display name.

export type FeedResult =
  | { ok: true; url: string; feed: string; title?: string }
  | { ok: false; error: string };

export async function resolveSubstackFeed(input: string): Promise<FeedResult> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter a Substack URL." };

  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Use an http(s) URL." };
  }

  // Strip trailing slashes and any /feed the user may have included.
  const root = `${parsed.origin}${parsed.pathname.replace(/\/+$/, "").replace(/\/feed$/, "")}`;
  const feed = `${root}/feed`;

  let feedRes: Response;
  try {
    feedRes = await fetch(feed, {
      headers: { "user-agent": "ClawCast/1.0 (+https://theclawcast.com)" },
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      error: `Could not reach the feed (${(err as Error).message}).`,
    };
  }

  if (!feedRes.ok) {
    return {
      ok: false,
      error: `No RSS feed at ${feed} (HTTP ${feedRes.status}).`,
    };
  }

  const xml = await feedRes.text();
  if (!/<rss[\s>]/i.test(xml) && !/<feed[\s>]/i.test(xml)) {
    return {
      ok: false,
      error: "That URL responded, but it didn't look like an RSS feed.",
    };
  }

  const title = extractTitle(xml);
  return { ok: true, url: root, feed, title };
}

function extractTitle(xml: string): string | undefined {
  const match = xml.match(/<title(?:\s[^>]*)?>([^<]+)<\/title>/i);
  if (!match) return undefined;
  return decodeXmlEntities(match[1].trim()).slice(0, 120);
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
