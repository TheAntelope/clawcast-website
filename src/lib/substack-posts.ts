// Fetches the latest items from a Substack-style RSS feed and converts each
// item's HTML body into clean text suitable for TTS narration.
//
// We use a tolerant regex parser instead of a real XML library because
// Substack's <content:encoded> is HTML wrapped in CDATA — regexes handle it
// fine for our needs and avoid the dependency.

export type SubstackPost = {
  title: string;
  link: string;
  guid: string;
  pubDate: string; // ISO 8601, or original if unparseable
  excerpt: string; // short, plain-text summary for the UI
  text: string; // full body text suitable for TTS
  wordCount: number;
};

export type FetchPostsResult =
  | { ok: true; posts: SubstackPost[] }
  | { ok: false; error: string };

export async function fetchLatestPosts(
  feedUrl: string,
  limit = 5,
): Promise<FetchPostsResult> {
  let res: Response;
  try {
    res = await fetch(feedUrl, {
      headers: { "user-agent": "ClawCast/1.0 (+https://theclawcast.com)" },
      cache: "no-store",
    });
  } catch (err) {
    return {
      ok: false,
      error: `Could not reach the feed (${(err as Error).message}).`,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `Feed responded with HTTP ${res.status}.`,
    };
  }

  const xml = await res.text();
  const items = extractItems(xml).slice(0, limit);
  if (items.length === 0) {
    return { ok: false, error: "The feed has no posts yet." };
  }

  const posts = items.map((raw) => parseItem(raw));
  return { ok: true, posts };
}

function extractItems(xml: string): string[] {
  const out: string[] = [];
  const re = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    out.push(match[1]);
  }
  return out;
}

function parseItem(raw: string): SubstackPost {
  const title = pickTag(raw, "title") ?? "Untitled";
  const link = pickTag(raw, "link") ?? "";
  const guid = pickTag(raw, "guid") ?? (link || title);
  const pubDateRaw = pickTag(raw, "pubDate") ?? "";
  const pubDate = normaliseDate(pubDateRaw);

  // Prefer <content:encoded> (full body); fall back to <description>.
  const bodyHtml =
    pickTag(raw, "content:encoded") ?? pickTag(raw, "description") ?? "";
  const text = htmlToText(bodyHtml);
  const excerpt = makeExcerpt(text);
  const wordCount = countWords(text);

  return { title, link, guid, pubDate, excerpt, text, wordCount };
}

function pickTag(xml: string, tag: string): string | undefined {
  const safe = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<${safe}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safe}>`, "i");
  const m = xml.match(re);
  if (!m) return undefined;
  return stripCdata(m[1]).trim() || undefined;
}

function stripCdata(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i, "$1");
}

function htmlToText(html: string): string {
  return html
    // Drop the bits we never want narrated.
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, " ")
    .replace(/<figcaption\b[\s\S]*?<\/figcaption>/gi, " ")
    // Convert block-ish tags to paragraph breaks so the TTS pauses naturally.
    .replace(/<\/?(p|div|section|article|h[1-6]|li|blockquote|br)[^>]*>/gi, "\n")
    // Strip remaining tags.
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    // Collapse whitespace, preserve paragraph breaks.
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function makeExcerpt(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 220) return flat;
  return flat.slice(0, 217).trimEnd() + "…";
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function normaliseDate(s: string): string {
  if (!s) return new Date().toISOString();
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toISOString();
}

// Caps text at the byte budget ElevenLabs handles comfortably in one request.
// We aim for ~5 minutes of audio (~750 words at 150 wpm ≈ 4500 chars), with a
// little slack so we can land on a sentence boundary.
export function truncateForEpisode(
  text: string,
  maxChars = 5000,
): { text: string; truncated: boolean; chars: number } {
  if (text.length <= maxChars) {
    return { text, truncated: false, chars: text.length };
  }
  const slice = text.slice(0, maxChars);
  // Walk back to the last sentence break so we don't cut mid-sentence.
  const cutAt = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf(".\n"),
    slice.lastIndexOf("!\n"),
    slice.lastIndexOf("?\n"),
  );
  const safe = cutAt > maxChars * 0.6 ? slice.slice(0, cutAt + 1) : slice;
  return { text: safe.trimEnd() + " …", truncated: true, chars: safe.length };
}
