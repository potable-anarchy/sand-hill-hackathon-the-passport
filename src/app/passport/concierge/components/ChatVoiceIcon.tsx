"use client";

import { useRef, useState } from "react";

type Props = {
  voiceUrl?: string;
};

/**
 * Small 20px sage-olive circle with a white play arrow.
 * Positioned absolutely in the bottom-right of a James (incoming) bubble.
 * If voiceUrl is provided, tapping plays the audio inline. If not, the icon
 * still renders for visual continuity but tapping is a no-op.
 */
export default function ChatVoiceIcon({ voiceUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const onClick = () => {
    if (!voiceUrl) return;
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      a.currentTime = 0;
      setPlaying(false);
    } else {
      void a.play();
      setPlaying(true);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={voiceUrl ? "Play voice message" : "Voice not available"}
        onClick={onClick}
        className="absolute bottom-2 right-2 flex items-center justify-center rounded-full"
        style={{
          width: 20,
          height: 20,
          background: "var(--sage-olive, #7f8e6f)",
          color: "var(--surface-white, #ffffff)",
          opacity: voiceUrl ? 1 : 0.55,
          cursor: voiceUrl ? "pointer" : "default",
          border: "none",
          padding: 0,
        }}
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="currentColor"
          aria-hidden
        >
          <path d="M1.5 0.75 L6.75 4 L1.5 7.25 Z" />
        </svg>
      </button>
      {voiceUrl ? (
        <audio
          ref={audioRef}
          src={voiceUrl}
          preload="none"
          onEnded={() => setPlaying(false)}
        />
      ) : null}
    </>
  );
}
