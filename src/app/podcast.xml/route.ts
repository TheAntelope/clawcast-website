// The ClawCast podcast RSS feed. Spotify, Apple Podcasts, etc. pull episodes
// from this URL — we never push to them.
//
// Submission flow (manual, one-time per platform):
//   1. Visit https://podcasters.spotify.com (or Apple Podcasts Connect)
//   2. Add a show, paste the public URL of this route
//   3. Verify ownership via the email on the feed (see `<itunes:owner>`)
//
// Before submitting we still need real cover art at /clawcast-cover.png
// (1400x1400 minimum, square JPEG or PNG). Spotify will reject the feed
// without it.

import { headers } from "next/headers";
import { listEpisodes, type EpisodeMeta } from "@/lib/episodes";

export const dynamic = "force-dynamic";

const SHOW_TITLE = "ClawCast";
const SHOW_DESCRIPTION =
  "Newsletters, narrated. ClawCast renders the writers you follow into short, listenable episodes — read in their own voice (or one they picked).";
const SHOW_AUTHOR = "ClawCast";
const SHOW_OWNER_EMAIL = "Vince@theclawcast.com";
const SHOW_LANGUAGE = "en-us";
const SHOW_CATEGORY = "Technology";

export async function GET(): Promise<Response> {
  const episodes = await listEpisodes();
  const origin = await resolveOrigin();
  const xml = buildFeed({ origin, episodes });
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=60",
    },
  });
}

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "theclawcast.com";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function buildFeed(args: {
  origin: string;
  episodes: EpisodeMeta[];
}): string {
  const { origin, episodes } = args;
  const feedUrl = `${origin}/podcast.xml`;
  const coverUrl = `${origin}/clawcast-cover.png`;
  const lastBuildDate = formatRfc822(
    episodes[0]?.pubDate ?? new Date().toISOString(),
  );

  const items = episodes.map((ep) => renderItem(ep)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SHOW_TITLE)}</title>
    <link>${esc(origin)}</link>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>${esc(SHOW_LANGUAGE)}</language>
    <description>${esc(SHOW_DESCRIPTION)}</description>
    <lastBuildDate>${esc(lastBuildDate)}</lastBuildDate>
    <itunes:author>${esc(SHOW_AUTHOR)}</itunes:author>
    <itunes:summary>${esc(SHOW_DESCRIPTION)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:owner>
      <itunes:name>${esc(SHOW_AUTHOR)}</itunes:name>
      <itunes:email>${esc(SHOW_OWNER_EMAIL)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${esc(coverUrl)}" />
    <itunes:category text="${esc(SHOW_CATEGORY)}" />
${items}
  </channel>
</rss>
`;
}

function renderItem(ep: EpisodeMeta): string {
  return `    <item>
      <title>${esc(ep.title)}</title>
      <description>${esc(ep.description)}</description>
      <pubDate>${esc(formatRfc822(ep.pubDate))}</pubDate>
      <guid isPermaLink="false">${esc(ep.sourcePostGuid || ep.slug)}</guid>
      <link>${esc(ep.sourcePostUrl)}</link>
      <enclosure url="${esc(ep.audioUrl)}" length="${ep.audioBytes}" type="audio/mpeg" />
      <itunes:duration>${formatDuration(ep.durationSeconds)}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
      <itunes:author>${esc(ep.voiceName)}</itunes:author>
    </item>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${mm}:${pad(ss)}`;
}
