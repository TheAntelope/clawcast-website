import { NextRequest, NextResponse } from "next/server";

import {
  NewsletterPodApiError,
  NewsletterPodConfigError,
  generateUserPod,
} from "@/lib/newsletter-pod";

// A full pod generation (LLM script + multi-segment TTS + optional music) can
// run well over a minute; allow the platform max so it isn't cut short.
export const maxDuration = 300;

// Same-origin endpoint the "Generate my pod" panel posts to. Triggers the real
// per-user generation server-side (with the job token) and returns the run
// result so the studio can link the feed / play the episode.
export async function POST(req: NextRequest) {
  let body: { identifier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const identifier = (body.identifier ?? "").trim();
  if (!identifier) {
    return NextResponse.json({ error: "Enter your email or user id" }, { status: 400 });
  }
  const opts = identifier.includes("@") ? { email: identifier } : { userId: identifier };
  try {
    const result = await generateUserPod(opts);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof NewsletterPodConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof NewsletterPodApiError) {
      const detail = err.detail as { detail?: unknown } | string | null;
      const message =
        detail && typeof detail === "object" && typeof detail.detail === "string"
          ? detail.detail
          : err.message;
      return NextResponse.json({ error: message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
