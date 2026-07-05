import { NextRequest, NextResponse } from "next/server";

import {
  NewsletterPodApiError,
  NewsletterPodConfigError,
  previewBlueprint,
  type ShowBlueprint,
} from "@/lib/newsletter-pod";

// Same-origin endpoint the client editor posts the current (unsaved) blueprint
// to. Runs the backend dry-run server-side (with the job token) and returns the
// shaped script so the studio can show the effect before saving a version.
export async function POST(req: NextRequest) {
  let body: { blueprint?: ShowBlueprint; text_only?: boolean; identifier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.blueprint) {
    return NextResponse.json({ error: "Missing blueprint" }, { status: 400 });
  }
  // Preview AS the account the operator typed in the Generate panel, so it uses
  // that user's real sources + profile. An "@" means email, otherwise a user id.
  const identifier = (body.identifier ?? "").trim();
  const who = identifier.includes("@")
    ? { email: identifier }
    : identifier
      ? { userId: identifier }
      : {};
  try {
    const result = await previewBlueprint(body.blueprint, {
      textOnly: body.text_only ?? true,
      ...who,
    });
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
