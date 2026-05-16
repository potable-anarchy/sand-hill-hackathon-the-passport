"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  experienceName?: string;
  slot?: string;
  unlock?: string;
  stampsEarned?: number;
};

export function StampConfirmation({
  open,
  onClose,
  experienceName,
  slot,
  unlock,
  stampsEarned,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(31, 30, 26, 0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-[12px] border p-8"
        style={{
          background: "var(--surface-white, #FFFFFF)",
          borderColor: "var(--divider, #E8E4DC)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[16px]"
            style={{ color: "var(--ink-tertiary, #8E8A82)" }}
          >
            ✕
          </button>
        </div>

        <div className="mt-2 text-center">
          <div
            className="text-[28px]"
            style={{
              fontFamily:
                "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
              color: "var(--accent-olive, #7F8E6F)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            ⌘ Stamp earned
          </div>

          {(experienceName || slot) && (
            <div
              className="mt-3 text-[14px]"
              style={{ color: "var(--ink-secondary, #5C5953)" }}
            >
              {[experienceName, slot].filter(Boolean).join(" · ")}
            </div>
          )}

          {unlock && (
            <div
              className="mx-auto mt-4 max-w-[260px] text-[14px] leading-relaxed"
              style={{ color: "var(--ink-primary, #1F1E1A)" }}
            >
              {unlock}
            </div>
          )}

          {typeof stampsEarned === "number" && (
            <div
              className="mt-5 text-[13px] font-medium"
              style={{
                color: "var(--accent-brass, #A88A56)",
                letterSpacing: "0.02em",
              }}
            >
              + 1 Stamp at Sand Hill ({stampsEarned} total)
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-[2px] py-3 text-[14px] font-medium tracking-wide"
          style={{
            background: "var(--ink-primary, #1F1E1A)",
            color: "var(--bg-cream, #FAF7F2)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
