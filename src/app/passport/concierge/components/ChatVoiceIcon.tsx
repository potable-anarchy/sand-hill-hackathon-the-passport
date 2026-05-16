"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Text to synthesize via ElevenLabs TTS (preferred). */
  text?: string;
  /** Optional pre-rendered audio URL — overrides text-based generation. */
  voiceUrl?: string;
};

/**
 * Sage-olive play button positioned bottom-right of a James (incoming) bubble.
 *
 * Behavior:
 * - If `voiceUrl` is provided, plays it directly.
 * - Otherwise, on first tap, POSTs `text` to `/api/tts` to get an MP3 from
 *   ElevenLabs, caches the resulting blob URL, and plays.
 * - Subsequent taps toggle play/pause without re-fetching.
 * - If `/api/tts` returns 503 (no API key), renders as inactive permanently.
 */

// Module-level capability probe — fired once per session, shared across icons.
let capabilityPromise: Promise<boolean> | null = null;
function probeCapability(): Promise<boolean> {
  if (capabilityPromise) return capabilityPromise;
  capabilityPromise = fetch("/api/tts", { method: "GET" })
    .then((r) => r.json())
    .then((j) => Boolean(j?.available))
    .catch(() => false);
  return capabilityPromise;
}

export default function ChatVoiceIcon({ text, voiceUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    voiceUrl ?? null,
  );
  const [available, setAvailable] = useState<boolean | null>(
    voiceUrl ? true : null,
  );

  // Probe whether TTS is configured server-side. Skip if we already have a URL.
  useEffect(() => {
    if (voiceUrl) return;
    if (!text) {
      setAvailable(false);
      return;
    }
    let cancelled = false;
    probeCapability().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [text, voiceUrl]);

  const interactable = available !== false;

  const onClick = async () => {
    if (!interactable || loading) return;

    // If we already have a URL, toggle play/pause.
    if (resolvedUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setPlaying(false);
      } else {
        void audioRef.current.play().then(() => setPlaying(true));
      }
      return;
    }

    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        if (res.status === 503) setAvailable(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResolvedUrl(url);
      // Play on next tick once <audio src> updates.
      setTimeout(() => {
        if (audioRef.current) {
          void audioRef.current.play().then(() => setPlaying(true));
        }
      }, 40);
    } catch (e) {
      console.error("[ChatVoiceIcon] TTS fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={
          interactable
            ? playing
              ? "Pause voice message"
              : "Play voice message"
            : "Voice not available"
        }
        onClick={onClick}
        disabled={loading || !interactable}
        className="absolute bottom-2 right-2 flex items-center justify-center rounded-full transition-opacity"
        style={{
          width: 20,
          height: 20,
          background: "var(--sage-olive, #7f8e6f)",
          color: "var(--surface-white, #ffffff)",
          opacity: interactable ? (loading ? 0.5 : 1) : 0.4,
          cursor: interactable && !loading ? "pointer" : "default",
          border: "none",
          padding: 0,
        }}
      >
        {loading ? (
          <span style={{ fontSize: 10, lineHeight: 1 }}>·</span>
        ) : playing ? (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
            <rect x="1.5" y="1" width="1.5" height="6" />
            <rect x="5" y="1" width="1.5" height="6" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
            <path d="M1.5 0.75 L6.75 4 L1.5 7.25 Z" />
          </svg>
        )}
      </button>
      {resolvedUrl ? (
        <audio
          ref={audioRef}
          src={resolvedUrl}
          preload="none"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
        />
      ) : null}
    </>
  );
}
