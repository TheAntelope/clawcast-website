"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  NewsletterPodApiError,
  putBlueprint,
  restoreBlueprint,
  type ShowBlueprint,
} from "@/lib/newsletter-pod";

const STUDIO_PATH = "/admin/studio";
const FLASH_MAX_CHARS = 600;

function describeError(err: unknown): string {
  if (err instanceof NewsletterPodApiError) {
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

function flashRedirect(key: string, value: string): never {
  const trimmed =
    value.length > FLASH_MAX_CHARS ? value.slice(0, FLASH_MAX_CHARS) + "…" : value;
  redirect(`${STUDIO_PATH}?${key}=${encodeURIComponent(trimmed)}`);
}

function readForm(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveBlueprintAction(formData: FormData) {
  // The client editor packs the entire edited blueprint as JSON into a single
  // hidden input (mirrors SourcePicker). We parse it here and let the backend
  // do the authoritative validation (returns 400 on a bad shape).
  const raw = readForm(formData, "blueprint_json").trim();
  const note = readForm(formData, "note").trim();
  let blueprint: ShowBlueprint;
  try {
    blueprint = JSON.parse(raw) as ShowBlueprint;
  } catch {
    flashRedirect("save_error", "Could not read the editor state — nothing saved.");
  }

  try {
    const saved = await putBlueprint(blueprint, note || null);
    revalidatePath(STUDIO_PATH);
    flashRedirect("save_success", `Saved version ${saved.version}`);
  } catch (err) {
    flashRedirect("save_error", describeError(err));
  }
}

export async function restoreBlueprintAction(formData: FormData) {
  const version = Number.parseInt(readForm(formData, "version"), 10);
  if (!Number.isFinite(version)) return;
  try {
    const saved = await restoreBlueprint(version);
    revalidatePath(STUDIO_PATH);
    flashRedirect("save_success", `Restored v${version} as version ${saved.version}`);
  } catch (err) {
    flashRedirect("save_error", describeError(err));
  }
}
