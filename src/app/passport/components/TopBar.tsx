type Props = {
  stampsEarned: number;
};

export function TopBar({ stampsEarned }: Props) {
  return (
    <header
      className="flex items-baseline justify-between border-b px-6 pt-8 pb-4"
      style={{
        borderColor: "var(--divider, #E8E4DC)",
        background: "var(--bg-cream, #FAF7F2)",
      }}
    >
      <div
        className="text-[18px]"
        style={{
          fontFamily:
            "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
          color: "var(--ink-primary, #1F1E1A)",
          fontWeight: 400,
        }}
      >
        the passport
      </div>
      <div
        className="text-[13px] tracking-wide"
        style={{
          color: "var(--accent-brass, #A88A56)",
          fontWeight: 500,
        }}
      >
        {stampsEarned} ⌘
      </div>
    </header>
  );
}
