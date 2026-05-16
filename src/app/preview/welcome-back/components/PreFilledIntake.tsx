"use client";

import { useState } from "react";

type Props = {
  prompt: string;
  prefill: string;
  helperCaption?: string;
};

/**
 * Single-screen Passport Preview body for the loop-close.
 * Serif prompt + editable textarea pre-filled with a draft drawn from the
 * guest's prior observations. Small tertiary helper caption underneath, and
 * a Next → CTA aligned to the right of the bottom row.
 */
export default function PreFilledIntake({
  prompt,
  prefill,
  helperCaption = "— pre-filled from your last stay",
}: Props) {
  const [value, setValue] = useState(prefill);

  return (
    <div className="flex flex-col flex-1">
      <h2
        className="text-[22px] leading-[1.25] mb-4"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          color: "var(--ink-primary)",
        }}
      >
        {prompt}
      </h2>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full min-h-[140px] p-4 rounded text-[15px] leading-[1.5] resize-none outline-none focus:border-[color:var(--ink-secondary)] transition-colors"
        style={{
          background: "var(--surface-white)",
          border: "1px solid var(--divider)",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-sans)",
        }}
      />

      <div
        className="mt-2 text-[11px]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        {helperCaption}
      </div>

      <div className="mt-auto pt-8 flex items-center justify-between">
        <span />
        <button
          onClick={() => {
            /* hand-off would happen here; intentionally non-navigational for demo */
          }}
          className="px-7 py-3.5 text-[14px] font-medium tracking-[0.02em] rounded-[2px]"
          style={{
            background: "var(--ink-primary)",
            color: "var(--bg-cream)",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
