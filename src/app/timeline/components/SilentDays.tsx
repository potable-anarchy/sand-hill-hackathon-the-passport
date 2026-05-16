type Props = {
  range: string; // e.g. "15–59"
  dotCount?: number;
};

/**
 * Quiet visual gap between TimelineMessages — a row of hollow dots and a
 * range caption, conveying intentional silence between concierge messages.
 */
export default function SilentDays({ range, dotCount = 8 }: Props) {
  const dots = "◌ ".repeat(dotCount).trim();
  return (
    <div className="flex items-center gap-3 py-5 px-1">
      <span
        className="text-[11px] tracking-[0.06em]"
        style={{ color: "var(--ink-tertiary)" }}
      >
        days {range}
      </span>
      <span
        className="flex-1 text-[18px] leading-none tracking-[0.15em] select-none"
        style={{ color: "var(--divider)" }}
        aria-hidden
      >
        {dots}
      </span>
    </div>
  );
}
