import { NextRequest, NextResponse } from "next/server";

import {
  NewsletterPodApiError,
  NewsletterPodConfigError,
  startUserPod,
  type ShowBlueprint,
} from "@/lib/newsletter-pod";

// Starting a run returns immediately (a run_id); the client then polls
// /admin/studio/generate/status. No long-held connection, so no serverless
// timeout.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { identifier?: string; blueprint?: ShowBlueprint | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const identifier = (body.identifier ?? "").trim();
  if (!identifier) {
    return NextResponse.json({ error: "Enter your email or user id" }, { status: 400 });
  }
  // A blueprint present means "regenerate with these edits" (the draft renders
  // for real); absent means generate with the saved/global blueprint. The
  // backend validates the draft and 400s a malformed one.
  const who = identifier.includes("@") ? { email: identifier } : { userId: identifier };
  const opts = { ...who, blueprint: body.blueprint ?? null };
  try {
    return NextResponse.json(await startUserPod(opts));
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
