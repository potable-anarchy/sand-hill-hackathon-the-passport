import { getState } from "@/lib/state";
import { CONCIERGE } from "@/lib/property-catalog";
import CadenceChip from "./components/CadenceChip";
import TimelineMessage from "./components/TimelineMessage";
import SilentDays from "./components/SilentDays";

/**
 * Post-checkout 12-month timeline (S6).
 *
 * Renders three concierge messages spread across the year with visible
 * silence between them. Phone-frame mock. Design tokens are injected inline
 * because globals.css is intentionally untouched in this codebase.
 */
export default function TimelinePage() {
  const state = getState();
  const guestName = state.guest.name;
  const conciergeName = CONCIERGE.name;

  return (
    <>
      <style>{`
        :root {
          --bg-cream: #faf7f2;
          --surface-paper: #fcfaf6;
          --surface-white: #ffffff;
          --ink-primary: #1f1e1a;
          --ink-secondary: #5c5953;
          --ink-tertiary: #8e8a82;
          --accent-olive: #7f8e6f;
          --accent-brass: #a88a56;
          --accent-clay: #b07a6b;
          --divider: #e8e4dc;
          --font-serif: "Cormorant Garamond", "Playfair Display", Georgia, serif;
          --font-sans: "Inter", system-ui, -apple-system, sans-serif;
        }
        .phone-frame {
          width: 390px;
          max-width: 100%;
          height: 844px;
          max-height: 100vh;
          background: var(--bg-cream);
          border: 1px solid var(--ink-tertiary);
          border-radius: 36px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .phone-frame::before {
          content: "";
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: var(--ink-primary);
          opacity: 0.15;
          border-radius: 2px;
          z-index: 10;
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <main
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{
          background: "#e8e4dc",
          fontFamily:
            "var(--font-sans, Inter, system-ui, -apple-system, sans-serif)",
          color: "var(--ink-primary)",
        }}
      >
        <div className="phone-frame">
          {/* TopBar */}
          <div
            className="flex items-baseline justify-between px-6 pt-8 pb-4 border-b"
            style={{ borderColor: "var(--divider)" }}
          >
            <div
              className="text-[18px]"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                color: "var(--ink-primary)",
              }}
            >
              the passport
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              {guestName.toLowerCase()}
            </div>
          </div>

          {/* Scrubbable content */}
          <div className="flex-1 px-6 pt-6 pb-8 overflow-y-auto">
            <h1
              className="text-[32px] leading-[1.15] mb-3"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: "var(--ink-primary)",
              }}
            >
              Your year
            </h1>

            <CadenceChip label="High engagement · 3 messages this year" />

            <div className="mt-6 space-y-1">
              {/* Day 14 */}
              <TimelineMessage
                fromName={conciergeName}
                dayLabel="Day 14 · May 30"
                voice
                body="Reni at Madera is working on a summer tasting and remembered you."
              />

              <SilentDays range="15–59" dotCount={8} />

              {/* Day 60 */}
              <TimelineMessage
                fromName={conciergeName}
                dayLabel="Day 60 · July 15"
                voice
                photo
                body="It's been 60 days since you watched this. The deck is open tonight."
                caption="◇ encrypted to your account"
              />

              <SilentDays range="61–89" dotCount={6} />

              {/* Day 90 */}
              <TimelineMessage
                fromName={conciergeName}
                dayLabel="Day 90 · Aug 14"
                body="The Ridge Rosé Reveal is back in September. Sand Hill's hosting. I held a seat."
                cta={{ label: "Plan a stay →", href: "/preview/welcome-back" }}
              />
            </div>

            <div
              className="mt-8 text-center text-[11px] uppercase tracking-[0.12em]"
              style={{ color: "var(--ink-tertiary)" }}
            >
              — the rest of the year is quiet —
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
