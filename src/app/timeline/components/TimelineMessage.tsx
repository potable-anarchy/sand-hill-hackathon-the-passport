import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  fromName: string;
  dayLabel: string; // e.g. "Day 14 · May 30"
  body: string;
  voice?: boolean;
  photo?: boolean;
  caption?: string;
  cta?: { label: string; href: string };
  children?: ReactNode;
};

/**
 * A single concierge message card in the post-checkout timeline.
 * White card, hairline border, 12px corners, 16px padding.
 * "From {name}" line (serif 15px) with optional sage-olive voice icon inline.
 * Optional sunset-gradient photo placeholder above the body.
 * Optional footer caption ("encrypted to your account") or CTA link.
 */
export default function TimelineMessage({
  fromName,
  dayLabel,
  body,
  voice = false,
  photo = false,
  caption,
  cta,
  children,
}: Props) {
  return (
    <article
      className="rounded-[12px] p-4"
      style={{
        background: "var(--surface-white)",
        border: "1px solid var(--divider)",
      }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.08em] mb-2"
        style={{ color: "var(--ink-tertiary)" }}
      >
        {dayLabel}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[15px]"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            color: "var(--ink-primary)",
          }}
        >
          From {fromName}
        </span>
        {voice && (
          <span
            aria-label="Voice message available"
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 20,
              height: 20,
              background: "var(--accent-olive)",
              color: "var(--surface-white)",
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden>
              <path d="M1.5 0.75 L6.75 4 L1.5 7.25 Z" />
            </svg>
          </span>
        )}
      </div>

      {photo && (
        <div
          className="mb-3 flex items-end justify-center"
          style={{
            height: 180,
            borderRadius: 6,
            background:
              "linear-gradient(135deg, #c9a878 0%, #7d8466 100%)",
          }}
        >
          <span
            className="mb-3 text-[11px] uppercase"
            style={{
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.08em",
            }}
          >
            YOUR SUNSET PHOTO
          </span>
        </div>
      )}

      <p
        className="text-[13px] leading-[1.55]"
        style={{ color: "var(--ink-secondary)" }}
      >
        {body}
      </p>

      {caption && (
        <div
          className="mt-3 text-[11px]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          {caption}
        </div>
      )}

      {cta && (
        <div className="mt-4">
          <Link
            href={cta.href}
            className="inline-block px-4 py-2 text-[13px] tracking-[0.02em] rounded-[2px]"
            style={{
              background: "var(--ink-primary)",
              color: "var(--bg-cream)",
            }}
          >
            {cta.label}
          </Link>
        </div>
      )}

      {children}
    </article>
  );
}
