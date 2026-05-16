"use client";

import { useState } from "react";
import { experienceById } from "@/lib/property-catalog";
import type { PassportItem } from "@/lib/types";

const DEMO_PHOTO_URL = "/demo/marcie-hackathon.jpg";

type Props = {
  open: boolean;
  targetItem: PassportItem | null;
  onClose: () => void;
  onSubmit: (params: { itemId: string; photoUrl: string }) => Promise<void>;
};

export function PhotoUploadSheet(props: Props) {
  if (!props.open) return null;
  return <PhotoUploadSheetBody {...props} />;
}

function PhotoUploadSheetBody({ targetItem, onClose, onSubmit }: Props) {
  // Demo mock: the photo is "already there" as soon as the sheet opens —
  // simulating what the user would have just taken / selected. No file
  // picker; tap the photo zone to reveal, tap Save to attach.
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const exp = targetItem ? experienceById(targetItem.experienceId) : null;
  const title = exp ? `${exp.name} · capture your experience` : "Save a memory";

  async function handlePost() {
    if (!targetItem || !revealed) return;
    setSubmitting(true);
    try {
      await onSubmit({ itemId: targetItem.id, photoUrl: DEMO_PHOTO_URL });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col"
      style={{ background: "var(--bg-cream, #FAF7F2)" }}
    >
      <header
        className="flex items-baseline justify-between border-b px-6 pt-8 pb-4"
        style={{ borderColor: "var(--divider, #E8E4DC)" }}
      >
        <div
          className="text-[15px]"
          style={{
            fontFamily:
              "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
            color: "var(--ink-primary, #1F1E1A)",
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-[16px]"
          style={{ color: "var(--ink-tertiary, #8E8A82)" }}
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-label={revealed ? "Photo selected" : "Tap to add a photo"}
          className="block w-full overflow-hidden rounded-[6px]"
          style={{
            aspectRatio: "4 / 5",
            background: revealed
              ? "transparent"
              : "linear-gradient(135deg, #1F1E1A 0%, #4A3C2D 100%)",
            cursor: revealed ? "default" : "pointer",
          }}
        >
          {revealed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={DEMO_PHOTO_URL}
              alt="your photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[11px] tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              TAP TO ADD PHOTO
            </div>
          )}
        </button>

        <div
          className="mt-6 text-[13px] leading-snug"
          style={{ color: "var(--ink-secondary, #5C5953)" }}
        >
          {exp?.unlock
            ? `Save to your Passport — unlocks ${lowerFirst(exp.unlock)}.`
            : "Save to your Passport to earn your unlock."}
        </div>

        <button
          type="button"
          disabled={!revealed || submitting}
          onClick={handlePost}
          className="mt-6 w-full rounded-[2px] py-4 text-[14px] font-medium tracking-wide disabled:opacity-40"
          style={{
            background: "var(--ink-primary, #1F1E1A)",
            color: "var(--bg-cream, #FAF7F2)",
          }}
        >
          {submitting ? "Saving…" : "Save to Passport"}
        </button>
      </div>
    </div>
  );
}

function lowerFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}
