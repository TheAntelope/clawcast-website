import { NextRequest, NextResponse } from "next/server";

import {
  NewsletterPodApiError,
  NewsletterPodConfigError,
  getUserPodStatus,
} from "@/lib/newsletter-pod";

// Short, cheap poll of a run started via ../generate. The client hits this
// every few seconds until the run reaches a terminal status.
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const runId = req.nextUrl.searchParams.get("run_id")?.trim();
  if (!userId || !runId) {
    return NextResponse.json({ error: "Missing user_id or run_id" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getUserPodStatus(userId, runId));
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
