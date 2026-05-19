"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../wizard.module.css";

type Phase = "idle" | "denied" | "unsupported" | "recording" | "recorded";

const MIN_SECONDS = 30;
const MAX_SECONDS = 240;

const CANDIDATE_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of CANDIDATE_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export function VoiceRecorder({
  onRecorded,
  onCleared,
}: {
  onRecorded: (file: File) => void;
  onCleared: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<number | null>(null);
  const mimeRef = useRef<string>("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopTicker = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTicker();
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl, stopStream, stopTicker]);

  const handleStart = useCallback(async () => {
    setErrorMsg(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setPhase("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      mimeRef.current = mime;
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        const ext = type.includes("mp4")
          ? "m4a"
          : type.includes("ogg")
            ? "ogg"
            : "webm";
        const name = `clawcast-voice-sample.${ext}`;
        const file = new File([blob], name, { type });
        setFilename(name);
        onRecorded(file);
        stopStream();
      };
      recorderRef.current = recorder;
      recorder.start(250);
      setSeconds(0);
      setPhase("recording");
      tickRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS) {
            if (recorderRef.current?.state === "recording") {
              recorderRef.current.stop();
            }
            stopTicker();
            setPhase("recorded");
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      const name = (err as { name?: string }).name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setPhase("denied");
      } else {
        setErrorMsg(
          `Couldn't start the recorder (${(err as Error).message || name || "unknown error"}).`,
        );
      }
    }
  }, [onRecorded, stopStream, stopTicker]);

  const handleStop = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    stopTicker();
    setPhase("recorded");
  }, [stopTicker]);

  const handleReset = useCallback(() => {
    stopTicker();
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFilename(null);
    setSeconds(0);
    setPhase("idle");
    onCleared();
  }, [onCleared, previewUrl, stopStream, stopTicker]);

  if (phase === "unsupported") {
    return (
      <p className={styles.notice}>
        Your browser doesn&rsquo;t support in-page audio recording. Use the
        file upload below instead — any 1–5 minute audio clip works.
      </p>
    );
  }

  return (
    <div className={styles.recorder}>
      {phase === "idle" ? (
        <div className={styles.recorderIdle}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleStart}
          >
            Start recording
          </button>
          <span className={styles.hint}>
            Your browser will ask for microphone access. Nothing leaves your
            device until you submit.
          </span>
        </div>
      ) : null}

      {phase === "recording" ? (
        <div className={styles.recorderActive}>
          <div className={styles.recorderPulse} aria-hidden="true">
            <span className={styles.recorderPulseDot} />
          </div>
          <div className={styles.recorderMeta}>
            <span className={styles.recorderTime}>{fmtTime(seconds)}</span>
            <span className={styles.hint}>
              Aim for at least {fmtTime(MIN_SECONDS)} — auto-stops at{" "}
              {fmtTime(MAX_SECONDS)}.
            </span>
          </div>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleStop}
          >
            Stop
          </button>
        </div>
      ) : null}

      {phase === "recorded" && previewUrl ? (
        <div className={styles.recorderRecorded}>
          <div className={styles.recorderMeta}>
            <span className={styles.recorderTime}>{fmtTime(seconds)}</span>
            <span className={styles.hint}>
              {seconds < MIN_SECONDS
                ? `Short clip — under ${fmtTime(MIN_SECONDS)}. Re-record for a better clone.`
                : "Looks good. Listen back and submit, or re-record."}
            </span>
          </div>
          <audio
            src={previewUrl}
            controls
            className={styles.recorderAudio}
            preload="metadata"
          />
          <div className={styles.recorderActions}>
            <a
              href={previewUrl}
              download={filename ?? "clawcast-voice-sample.webm"}
              className={styles.btnSecondary}
            >
              Save recording
            </a>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={handleReset}
            >
              Re-record
            </button>
          </div>
        </div>
      ) : null}

      {phase === "denied" ? (
        <p className={styles.notice}>
          Microphone access was blocked. Allow it in your browser&rsquo;s site
          settings and try again, or use the file upload below.
        </p>
      ) : null}

      {errorMsg ? (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
