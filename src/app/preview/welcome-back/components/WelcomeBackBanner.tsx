type Props = {
  guestName: string;
  message: string;
};

/**
 * Distinct banner at the top of the welcome-back intake.
 * Brass-tinted background, 1px brass border, 12px corners, 20px padding.
 * Caption label (brass, uppercase, tracked) above a serif callback sentence.
 */
export default function WelcomeBackBanner({ guestName, message }: Props) {
  return (
    <div
      className="rounded-[12px]"
      style={{
        background: "rgba(168, 138, 86, 0.08)",
        border: "1px solid var(--accent-brass)",
        padding: 20,
      }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.12em] mb-2"
        style={{ color: "var(--accent-brass)", fontWeight: 500 }}
      >
        WELCOME BACK, {guestName.toUpperCase()}
      </div>
      <p
        className="text-[17px] leading-[1.4]"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          color: "var(--ink-primary)",
          letterSpacing: "-0.005em",
        }}
      >
        {message}
      </p>
    </div>
  );
}
