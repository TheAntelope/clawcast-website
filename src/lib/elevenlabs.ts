// Thin wrapper around ElevenLabs' Instant Voice Cloning endpoint.
// https://elevenlabs.io/docs/api-reference/voices/add

const ENDPOINT = "https://api.elevenlabs.io/v1/voices/add";

export type CloneResult =
  | { ok: true; voiceId: string; name: string; mock: boolean }
  | { ok: false; error: string };

// Curated subset of ElevenLabs' default voice library. These IDs are stable
// public voices available to every API key, so we hand them off straight to
// the TTS step — no cloning roundtrip needed.
export type PremiumVoice = {
  id: string;
  name: string;
  vibe: string;
};

export const PREMIUM_VOICES: readonly PremiumVoice[] = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    vibe: "Warm, conversational — American female",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    vibe: "Soft, narrating — American female",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    vibe: "Natural, casual — Australian male",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    vibe: "Warm, mid-tone — British male",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    vibe: "Deep, authoritative — American male",
  },
  {
    id: "pFZP5JQG7iQjIQuC4Bku",
    name: "Lily",
    vibe: "Bright, friendly — British female",
  },
] as const;

export function findPremiumVoice(id: string): PremiumVoice | undefined {
  return PREMIUM_VOICES.find((v) => v.id === id);
}

// Text-to-speech: render a chunk of text in a saved voice. Returns the raw
// MP3 bytes so the caller can decide where to put them (Blob storage,
// streaming response, etc.).
//
// https://elevenlabs.io/docs/api-reference/text-to-speech/convert

const TTS_ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";
const TTS_MODEL_ID = "eleven_multilingual_v2";

export type SynthResult =
  | { ok: true; audio: ArrayBuffer; contentType: string }
  | { ok: false; error: string };

export async function synthesize(opts: {
  voiceId: string;
  text: string;
}): Promise<SynthResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "ELEVENLABS_API_KEY isn't set — wire it into .env.local before generating audio.",
    };
  }
  if (!opts.text.trim()) {
    return { ok: false, error: "Nothing to narrate — the post body was empty." };
  }

  const url = `${TTS_ENDPOINT}/${encodeURIComponent(opts.voiceId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: opts.text,
        model_id: TTS_MODEL_ID,
        voice_settings: { stability: 0.4, similarity_boost: 0.75 },
      }),
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
      error: `ElevenLabs rejected the synthesis (${res.status}): ${detail}`,
    };
  }

  const audio = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "audio/mpeg";
  return { ok: true, audio, contentType };
}

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
