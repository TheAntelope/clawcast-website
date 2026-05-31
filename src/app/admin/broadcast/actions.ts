"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  NewsletterPodApiError,
  deleteLoop,
  pasteFeedback,
  runLoop,
  upsertLoop,
  type UpsertLoopInput,
} from "@/lib/newsletter-pod";

const FLASH_MAX_CHARS = 600;

function describeError(err: unknown): string {
  if (err instanceof NewsletterPodApiError) {
    // Newsletter-pod's error body is usually {"detail": "..."}; surface that
    // directly so the operator sees the real backend message (e.g. the X 402
    // text) instead of a generic "request failed".
    const detail = err.detail as unknown;
    if (detail && typeof detail === "object" && "detail" in detail) {
      const inner = (detail as { detail: unknown }).detail;
      if (typeof inner === "string") return `Backend ${err.status}: ${inner}`;
    }
    if (typeof detail === "string") return `Backend ${err.status}: ${detail}`;
    return `Backend ${err.status}: ${err.message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

function flashRedirect(path: string, key: string, value: string): never {
  const trimmed = value.length > FLASH_MAX_CHARS ? value.slice(0, FLASH_MAX_CHARS) + "…" : value;
  redirect(`${path}?${key}=${encodeURIComponent(trimmed)}`);
}

function parseSeedTopics(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readForm(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readBoolean(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

function readOptionalString(formData: FormData, name: string): string | null {
  const value = readForm(formData, name);
  // Empty string means "no override / suppress" depending on field semantics;
  // pass through as null only when the form omits the field entirely. Trim
  // so blank-with-whitespace also reads as empty.
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function upsertLoopAction(formData: FormData) {
  const loopId = readForm(formData, "loop_id").trim();
  const input: UpsertLoopInput = {
    loop_id: loopId,
    region: readForm(formData, "region").trim(),
    timezone: readForm(formData, "timezone").trim(),
    audience_persona: readForm(formData, "audience_persona").trim(),
    post_local_time: readForm(formData, "post_local_time").trim() || "08:00",
    seed_topics: parseSeedTopics(readForm(formData, "seed_topics")),
    active: readBoolean(formData, "active"),
    feedback_prompt_text: readOptionalString(formData, "feedback_prompt_text"),
  };

  await upsertLoop(input);
  revalidatePath("/admin/broadcast");
  revalidatePath(`/admin/broadcast/loops/${loopId}`);
  redirect(`/admin/broadcast/loops/${loopId}`);
}

export async function deleteLoopAction(formData: FormData) {
  const loopId = readForm(formData, "loop_id").trim();
  if (!loopId) return;
  await deleteLoop(loopId);
  revalidatePath("/admin/broadcast");
  redirect("/admin/broadcast");
}

export async function runLoopAction(formData: FormData) {
  const loopId = readForm(formData, "loop_id").trim();
  if (!loopId) return;
  const tweetOverride = readForm(formData, "tweet_text_override").trim();
  const feedbackOverride = readForm(formData, "feedback_prompt_override");
  const detailPath = `/admin/broadcast/loops/${loopId}`;

  try {
    const result = await runLoop(loopId, {
      tweet_text_override: tweetOverride || undefined,
      // Empty string is a meaningful "suppress" — only omit when the field
      // wasn't present in the form (caller intends default copy).
      feedback_prompt_override: feedbackOverride.trim() === "" ? undefined : feedbackOverride,
    });
    revalidatePath(detailPath);
    // Surface successful tweet URL straight on the page so the operator
    // doesn't have to scroll the episodes list to confirm the post landed.
    if (result.episode_tweet_url) {
      flashRedirect(detailPath, "run_success", result.episode_tweet_url);
    }
    if (result.status === "skipped") {
      flashRedirect(detailPath, "run_skipped", result.reason ?? "Skipped");
    }
    flashRedirect(detailPath, "run_success", "Run completed");
  } catch (err) {
    flashRedirect(detailPath, "run_error", describeError(err));
  }
}

export async function pasteFeedbackAction(formData: FormData) {
  const episodeId = readForm(formData, "episode_id").trim();
  const loopId = readForm(formData, "loop_id").trim();
  const feedbackText = readForm(formData, "feedback_text").trim();
  if (!episodeId || !feedbackText) return;
  const detailPath = loopId ? `/admin/broadcast/loops/${loopId}` : "/admin/broadcast";
  try {
    await pasteFeedback(episodeId, feedbackText);
    if (loopId) revalidatePath(detailPath);
    flashRedirect(detailPath, "feedback_success", "Feedback saved");
  } catch (err) {
    flashRedirect(detailPath, "feedback_error", describeError(err));
  }
}
