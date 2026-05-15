import { cookies } from "next/headers";

export type WizardStep = "voice" | "feed" | "channels" | "done";

export type CreatorState = {
  id: string;
  voice?: { id: string; name: string; mock?: boolean };
  substack?: { url: string; feed: string; title?: string };
  channels?: string[];
  createdAt: string;
};

const COOKIE_NAME = "clawcast_creator";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function readCreatorState(): Promise<CreatorState | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as CreatorState;
    if (typeof decoded?.id !== "string") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function writeCreatorState(state: CreatorState): Promise<void> {
  const store = await cookies();
  const encoded = Buffer.from(JSON.stringify(state), "utf8").toString(
    "base64url",
  );
  store.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearCreatorState(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function ensureCreatorState(): Promise<CreatorState> {
  const existing = await readCreatorState();
  if (existing) return existing;
  const fresh: CreatorState = {
    id: cryptoRandomId(),
    createdAt: new Date().toISOString(),
  };
  await writeCreatorState(fresh);
  return fresh;
}

export function nextIncompleteStep(state: CreatorState | null): WizardStep {
  if (!state?.voice) return "voice";
  if (!state.substack) return "feed";
  if (!state.channels || state.channels.length === 0) return "channels";
  return "done";
}

function cryptoRandomId(): string {
  // 16 random bytes → 22-char base64url, plenty for an anonymous wizard id.
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return Buffer.from(buf).toString("base64url");
}
