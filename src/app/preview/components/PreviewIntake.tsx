"use client";

import { useEffect, useRef } from "react";

type Props = {
  step: 1 | 2 | 3;
  total: number;
  question: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  disabled?: boolean;
};

/**
 * A single intake prompt screen — one of the 3 sequential questions.
 * Serif headline question, textarea, progress, Next CTA.
 */
export default function PreviewIntake({
  step,
  total,
  question,
  placeholder,
  value,
  onChange,
  onNext,
  onBack,
  nextLabel = "Next →",
  disabled = false,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Focus the textarea when the step mounts so each new prompt is immediately writable.
    taRef.current?.focus();
  }, [step]);

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-baseline justify-between px-6 pt-8 pb-4 border-b border-[color:var(--divider)]">
        <div
          className="font-[var(--font-serif)] text-[18px] text-[color:var(--ink-primary)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          the passport
        </div>
        <div />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto flex flex-col">
        <h1
          className="text-[28px] leading-[1.2] text-[color:var(--ink-primary)] mt-12 mb-8"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          {question}
        </h1>

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] p-4 rounded text-[15px] leading-[1.5] resize-none outline-none focus:border-[color:var(--ink-secondary)] transition-colors"
          style={{
            background: "var(--surface-white)",
            border: "1px solid var(--divider)",
            color: "var(--ink-primary)",
            fontFamily: "var(--font-sans)",
          }}
        />

        <div
          className="mt-6 text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--ink-tertiary)" }}
        >
          — {step} of {total} —
        </div>

        <div className="mt-auto pt-8 flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="text-[13px] tracking-[0.02em]"
              style={{ color: "var(--ink-secondary)" }}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={onNext}
            disabled={disabled}
            className="px-7 py-3.5 text-[14px] font-medium tracking-[0.02em] rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--ink-primary)",
              color: "var(--bg-cream)",
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
