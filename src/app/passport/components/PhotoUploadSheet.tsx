"use client";

import { useRef, useState } from "react";
import { experienceById } from "@/lib/property-catalog";
import type { PassportItem } from "@/lib/types";

type Props = {
  open: boolean;
  targetItem: PassportItem | null;
  onClose: () => void;
  onSubmit: (params: { itemId: string; photoUrl: string }) => Promise<void>;
};

export function PhotoUploadSheet(props: Props) {
  if (!props.open) return null;
  // Body is mounted only while open so its internal state resets on each open.
  return <PhotoUploadSheetBody {...props} />;
}

function PhotoUploadSheetBody({ targetItem, onClose, onSubmit }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exp = targetItem ? experienceById(targetItem.experienceId) : null;
  const title = exp ? `${exp.name} · post a photo` : "Save a memory";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handlePost() {
    if (!targetItem || !preview) return;
    setSubmitting(true);
    try {
      await onSubmit({ itemId: targetItem.id, photoUrl: preview });
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
          onClick={() => fileInputRef.current?.click()}
          className="block w-full overflow-hidden rounded-[6px]"
          style={{
            aspectRatio: "4 / 5",
            background: preview
              ? "transparent"
              : "linear-gradient(135deg, #1F1E1A 0%, #4A3C2D 100%)",
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="preview"
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

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
          disabled={!preview || submitting}
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
