"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import styles from "../wizard.module.css";
import { generateEpisode, loadLatestPost } from "./preview-actions";
import type { EpisodeMeta } from "@/lib/episodes";
import type { SubstackPost } from "@/lib/substack-posts";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; posts: SubstackPost[] }
  | { kind: "error"; message: string }
  | { kind: "rendering"; guid: string; title: string; posts: SubstackPost[] }
  | {
      kind: "rendered";
      episode: EpisodeMeta;
      posts: SubstackPost[];
      truncated: boolean;
    };

export function PreviewLatest({
  feedTitle,
  voiceName,
  autoStart,
}: {
  feedTitle: string;
  voiceName: string;
  autoStart: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const autoStartedRef = useRef(false);

  const runAuto = useCallback(() => {
    setStatus({ kind: "loading" });
    startTransition(async () => {
      const fetched = await loadLatestPost();
      if (!fetched.ok) {
        setStatus({ kind: "error", message: fetched.error });
        return;
      }
      const target = fetched.posts[0];
      if (!target) {
        setStatus({ kind: "loaded", posts: fetched.posts });
        return;
      }
      setStatus({
        kind: "rendering",
        guid: target.guid,
        title: target.title,
        posts: fetched.posts,
      });
      const rendered = await generateEpisode(target.guid);
      if (!rendered.ok) {
        setStatus({ kind: "error", message: rendered.error });
        return;
      }
      setStatus({
        kind: "rendered",
        episode: rendered.episode,
        posts: fetched.posts,
        truncated: rendered.truncated,
      });
    });
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    runAuto();
  }, [autoStart, runAuto]);

  const handleLoad = () => {
    setStatus({ kind: "loading" });
    startTransition(async () => {
      const res = await loadLatestPost();
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      setStatus({ kind: "loaded", posts: res.posts });
    });
  };

  const handleGenerate = (post: SubstackPost) => {
    const posts =
      status.kind === "loaded" ||
      status.kind === "rendering" ||
      status.kind === "rendered"
        ? status.posts
        : [post];
    setStatus({
      kind: "rendering",
      guid: post.guid,
      title: post.title,
      posts,
    });
    startTransition(async () => {
      const res = await generateEpisode(post.guid);
      if (!res.ok) {
        setStatus({ kind: "error", message: res.error });
        return;
      }
      setStatus({
        kind: "rendered",
        episode: res.episode,
        posts,
        truncated: res.truncated,
      });
    });
  };

  if (status.kind === "idle") {
    return (
      <div className={styles.previewIdle}>
        <p className={styles.cardBody}>
          We&rsquo;ll poll <strong>{feedTitle}</strong> for new posts going
          forward — but want to render the most recent one right now in{" "}
          <strong>{voiceName}</strong>&rsquo;s voice?
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleLoad}
            disabled={isPending}
          >
            {isPending ? "Fetching…" : "Show me my latest posts"}
          </button>
        </div>
      </div>
    );
  }

  if (status.kind === "loading") {
    return (
      <p className={styles.cardBody}>
        Fetching the latest post from <strong>{feedTitle}</strong>…
      </p>
    );
  }

  if (status.kind === "error") {
    return (
      <>
        <p className={styles.error}>{status.message}</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleLoad}
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  const renderedEpisode =
    status.kind === "rendered" ? status.episode : null;
  const rendering =
    status.kind === "rendering"
      ? { guid: status.guid, title: status.title }
      : null;

  return (
    <div className={styles.previewList}>
      {rendering ? (
        <p className={styles.cardBody}>
          Rendering <strong>“{rendering.title}”</strong> in{" "}
          <strong>{voiceName}</strong>&rsquo;s voice — this takes 10–30 seconds.
        </p>
      ) : null}

      {renderedEpisode ? (
        <div className={styles.episodeCard}>
          <div className={styles.episodeHeader}>
            <span className={styles.episodeBadge}>Episode ready</span>
            <span className={styles.episodeMeta}>
              {voiceName} ·{" "}
              {Math.round(renderedEpisode.durationSeconds / 60)} min
              {status.kind === "rendered" && status.truncated
                ? " · first ~5 min of post"
                : ""}
            </span>
          </div>
          <h3 className={styles.episodeTitle}>{renderedEpisode.title}</h3>
          <audio
            src={renderedEpisode.audioUrl}
            controls
            preload="metadata"
            className={styles.recorderAudio}
          />
          <p className={styles.hint}>
            Live in the feed at{" "}
            <a href="/podcast.xml" target="_blank" rel="noreferrer">
              /podcast.xml
            </a>{" "}
            — submit that URL to Spotify for Podcasters to get the show on
            Spotify.
          </p>
          <div className={styles.actions}>
            <Link
              href="/creators/start/channels"
              className={styles.btnPrimary}
            >
              Continue to channels
            </Link>
          </div>
        </div>
      ) : null}

      <ol className={styles.previewPosts}>
        {status.posts.map((post) => {
          const isRendering = rendering?.guid === post.guid;
          const isRendered =
            renderedEpisode !== null &&
            renderedEpisode.sourcePostGuid === post.guid;
          return (
            <li key={post.guid} className={styles.previewPost}>
              <div className={styles.previewPostHead}>
                <strong className={styles.previewPostTitle}>
                  {post.title}
                </strong>
                <span className={styles.previewPostMeta}>
                  {formatDate(post.pubDate)} · {post.wordCount.toLocaleString()}{" "}
                  words
                </span>
              </div>
              <p className={styles.previewPostExcerpt}>{post.excerpt}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => handleGenerate(post)}
                  disabled={isPending || isRendering}
                >
                  {isRendering
                    ? "Rendering…"
                    : isRendered
                      ? "Re-render"
                      : "Render as episode"}
                </button>
                {post.link ? (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnGhost}
                  >
                    Read original
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
