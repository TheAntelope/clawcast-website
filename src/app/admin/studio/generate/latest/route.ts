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
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getLatestUserPod(userId));
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
