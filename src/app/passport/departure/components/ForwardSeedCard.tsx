type Props = {
  dateLabel: string;
  body: string;
};

/**
 * Forward-seed card — a quiet promise of what comes next.
 * White surface, hairline divider border, a 3px brass left border for emphasis,
 * 8px corners and 20px internal padding. Date in serif brass; body in sans
 * ink-primary.
 */
export default function ForwardSeedCard({ dateLabel, body }: Props) {
  return (
    <article
      style={{
        background: "var(--surface-white)",
        border: "1px solid var(--divider)",
        borderLeft: "3px solid var(--accent-brass)",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: 18,
          color: "var(--accent-brass)",
          letterSpacing: "-0.01em",
          marginBottom: 6,
        }}
      >
        {dateLabel}
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--ink-primary)",
          margin: 0,
        }}
      >
        {body}
      </p>
    </article>
  );
}
