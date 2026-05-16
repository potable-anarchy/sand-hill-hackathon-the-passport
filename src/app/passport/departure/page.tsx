import Link from "next/link";
import { getState } from "@/lib/state";
import { CONCIERGE } from "@/lib/property-catalog";
import ForwardSeedCard from "./components/ForwardSeedCard";
import DemoNav from "@/components/DemoNav";

// Inject design tokens locally (globals.css is intentionally untouched for the
// hackathon scaffold). Mirrors the preview route's approach so the Departure
// flow renders with the same cream surface, serif headlines, and phone-frame
// chrome as the rest of the demo.
const TOKEN_CSS = `
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
    --sage-olive: #7f8e6f;
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
  `;

// S5 — Departure. A full-screen takeover shown at checkout.
//   Headline → James's farewell bubble → stamps tally → forward-seed card → CTA.
// Reads stamp counts and guest name from the in-memory server state so the
// demo reflects whatever happened during the stay (redemptions update earned;
// banked accumulates loyalty across visits).
export default function DeparturePage() {
  const state = getState();
  const stampsEarned = state.stampsEarned;
  const stampsBanked = state.stampsBanked;
  const guestName = state.guest.name;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TOKEN_CSS }} />
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
        style={{ background: "#2b2620" }}
        aria-label={`Departure for ${guestName}`}
      >
        <div className="phone-frame">
          <div
            className="flex flex-col h-full"
            style={{
              padding: "64px 24px 32px 24px",
              background: "var(--bg-cream)",
            }}
          >
            {/* Headline */}
            <h1
              className="text-center"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: 36,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              Until next time
            </h1>

            {/* Stamps tally */}
            <div
              className="flex flex-col items-center"
              style={{ marginTop: 48, marginBottom: 32, gap: 6 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--accent-olive)",
                  letterSpacing: "0.01em",
                }}
              >
                ⌘ {stampsEarned} stamps earned
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--accent-clay)",
                  letterSpacing: "0.01em",
                }}
              >
                ⌘ {stampsBanked} stamps banked at Sand Hill
              </div>
            </div>

            {/* Forward-seed card */}
            <ForwardSeedCard
              dateLabel="Aug 1"
              body="We'll be in touch about the Ridge Rosé Reveal in September. Sand Hill's hosting. Your seat is held."
            />

            {/* CTA pinned to bottom — ghost style */}
            <div className="mt-auto" style={{ paddingTop: 32 }}>
              <Link
                href="/timeline"
                aria-label={`See the year ahead — sent by ${CONCIERGE.name}`}
                className="block w-full text-center"
                style={{
                  background: "transparent",
                  color: "var(--ink-primary)",
                  border: "1px solid var(--ink-primary)",
                  padding: "14px 0",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  fontFamily: "var(--font-sans)",
                  borderRadius: 2,
                  textDecoration: "none",
                }}
              >
                See the year ahead →
              </Link>
            </div>
          </div>
        </div>
        <DemoNav />
      </main>
    </>
  );
}
