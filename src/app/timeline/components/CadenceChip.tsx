type Props = {
  label: string;
};

/**
 * Small sage-olive tinted pill used at the top of the timeline to summarize
 * cadence — e.g. "High engagement · 3 messages this year".
 */
export default function CadenceChip({ label }: Props) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase"
      style={{
        background: "rgba(127, 142, 111, 0.12)",
        color: "var(--accent-olive)",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}
