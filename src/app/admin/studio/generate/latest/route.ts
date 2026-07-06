import { NextRequest, NextResponse } from "next/server";

import {
  NewsletterPodApiError,
  NewsletterPodConfigError,
  getLatestUserPod,
} from "@/lib/newsletter-pod";

export const maxDuration = 30;

// Returns the account's most recent published pod, used as a fallback player
// when a fresh generation has no new content.
export async function GET(req: NextRequest) {
  // Accept either a resolved user_id (the generation fallback path) or a raw
  // identifier (the on-mount baseline seed, which may be an email).
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const identifier = req.nextUrl.searchParams.get("identifier")?.trim();
  const id = userId || identifier;
  if (!id) {
    return NextResponse.json({ error: "Missing user_id or identifier" }, { status: 400 });
  }
  const opts = id.includes("@") ? { email: id } : { userId: id };
  try {
    return NextResponse.json(await getLatestUserPod(opts));
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
