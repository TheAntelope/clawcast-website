// Thin wrapper around ElevenLabs' Instant Voice Cloning endpoint.
// https://elevenlabs.io/docs/api-reference/voices/add

const ENDPOINT = "https://api.elevenlabs.io/v1/voices/add";

export type CloneResult =
  | { ok: true; voiceId: string; name: string; mock: boolean }
  | { ok: false; error: string };

export async function cloneVoice(opts: {
  name: string;
  description?: string;
  sample: File;
}): Promise<CloneResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    // POC fallback: if no key is configured, mint a fake voice id so the
    // wizard remains testable end-to-end in local/preview environments.
    return {
      ok: true,
      voiceId: `mock_${Math.random().toString(36).slice(2, 10)}`,
      name: opts.name,
      mock: true,
    };
  }

  const body = new FormData();
  body.append("name", opts.name);
  if (opts.description) body.append("description", opts.description);
  body.append("files", opts.sample, opts.sample.name || "sample.wav");

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body,
    });
  } catch (err) {
    return {
      ok: false,
      error: `Could not reach ElevenLabs (${(err as Error).message}).`,
    };
  }

  if (!res.ok) {
    const detail = await safeReadError(res);
    return {
      ok: false,
      error: `ElevenLabs rejected the sample (${res.status}): ${detail}`,
    };
  }

  const data = (await res.json()) as { voice_id?: string };
  if (!data.voice_id) {
    return { ok: false, error: "ElevenLabs returned no voice id." };
  }
  return { ok: true, voiceId: data.voice_id, name: opts.name, mock: false };
}

async function safeReadError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 240);
  } catch {
    return res.statusText;
  }
}
