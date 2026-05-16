"use client";

import type { PassportItem } from "@/lib/types";
import { experienceById } from "@/lib/property-catalog";

type Props = {
  item: PassportItem;
  onRedeem?: (item: PassportItem) => void;
  busy?: boolean;
};

export function PassportCard({ item, onRedeem, busy }: Props) {
  const exp = experienceById(item.experienceId);
  if (!exp) return null;

  const isStamped = item.state === "stamped";
  const isBanked = item.state === "banked";
  const isHeldOrUnlocked = item.state === "held" || item.state === "unlocked";

  return (
    <article
      className="mb-4 rounded-[12px] border p-5"
      style={{
        background: "var(--surface-white, #FFFFFF)",
        borderColor: "var(--divider, #E8E4DC)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="text-[11px] uppercase"
          style={{
            color: "var(--ink-tertiary, #8E8A82)",
            letterSpacing: "0.08em",
          }}
        >
          {item.slot}
        </div>
        {isStamped && (
          <span
            className="rounded-full px-2 py-[3px] text-[11px] font-medium tracking-wide text-white"
            style={{ background: "var(--accent-olive, #7F8E6F)" }}
          >
            ⌘ stamped
          </span>
        )}
        {isBanked && (
          <span
            className="rounded-full px-2 py-[3px] text-[11px] font-medium tracking-wide text-white"
            style={{ background: "var(--accent-clay, #B07A6B)" }}
          >
            ⌘ banked
          </span>
        )}
      </div>

      <h3
        className="mt-2 text-[19px] leading-tight"
        style={{
          fontFamily:
            "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
          color: "var(--ink-primary, #1F1E1A)",
          fontWeight: 400,
        }}
      >
        {exp.name}
      </h3>

      <div
        className="mt-1 text-[12px]"
        style={{
          color: "var(--ink-tertiary, #8E8A82)",
          letterSpacing: "0.02em",
        }}
      >
        {exp.location}
      </div>

      <div className="mt-3">
        <span
          className="inline-block rounded-full px-3 py-1 text-[12px]"
          style={{
            background: "rgba(127, 142, 111, 0.12)",
            color: "var(--accent-olive, #7F8E6F)",
            letterSpacing: "0.02em",
          }}
        >
          ◇ {exp.unlock}
        </span>
      </div>

      {isHeldOrUnlocked && onRedeem && (
        <div className="mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRedeem(item)}
            className="rounded-[2px] px-4 py-2 text-[12px] font-medium tracking-wide disabled:opacity-50"
            style={{
              background: "var(--ink-primary, #1F1E1A)",
              color: "var(--bg-cream, #FAF7F2)",
            }}
          >
            {busy
              ? "Redeeming…"
              : exp.photoRedemptionAppropriate
                ? "I'm here — post a photo"
                : "I'm here — redeem"}
          </button>
        </div>
      )}
    </article>
  );
}
