import { getState } from "@/lib/state";
import { CONCIERGE } from "@/lib/property-catalog";
import type { StaffObservation } from "@/lib/types";
import WelcomeBackBanner from "./components/WelcomeBackBanner";
import PreFilledIntake from "./components/PreFilledIntake";

const FALLBACK_CALLBACK = (concierge: string) =>
  `${concierge} mentioned your sister's wedding in Sonoma — Hong Kong has a great venue for the rehearsal dinner.`;

const FALLBACK_PREFILL =
  "A celebration weekend — Sonoma vineyards in the morning, Madera tasting again, deck at sunset.";

/**
 * Search the guest's observations for any structured field whose value
 * mentions Sonoma or a wedding, and build a concierge callback sentence
 * that references the staff member who captured it. Falls back to the
 * canonical demo line if no such observation exists.
 */
function buildCallback(
  observations: StaffObservation[],
  concierge: string,
): string {
  for (const obs of observations) {
    const matchKey = Object.entries(obs.structured).find(([, v]) => {
      const lv = String(v).toLowerCase();
      return lv.includes("sonoma") || lv.includes("wedding");
    });
    if (matchKey) {
      const [, val] = matchKey;
      const teller = obs.staffMember || concierge;
      return `${teller} remembered: ${val} — there's a quiet pocket of Sonoma waiting for you.`;
    }
    const lowerText = obs.text.toLowerCase();
    if (lowerText.includes("sonoma") || lowerText.includes("wedding")) {
      const teller = obs.staffMember || concierge;
      return `${teller} remembered what you mentioned about ${
        lowerText.includes("sonoma") ? "Sonoma" : "the wedding"
      } — we held a thought for it.`;
    }
  }
  return FALLBACK_CALLBACK(concierge);
}

/**
 * Welcome-back loop close (S7).
 *
 * A single Passport Preview screen pre-filled from the prior stay — the
 * demo's punchline. References any Sonoma/wedding observation captured
 * by staff during the original visit; otherwise uses the canonical
 * Sonoma line so the demo always lands.
 */
export default function WelcomeBackPage() {
  const state = getState();
  const guestName = state.guest.name;
  const callback = buildCallback(state.guest.observations, CONCIERGE.name);

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

          {/* Content */}
          <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto flex flex-col">
            <WelcomeBackBanner guestName={guestName} message={callback} />

            <div className="mt-6">
              <h1
                className="text-[32px] leading-[1.15] mb-1"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: "var(--ink-primary)",
                }}
              >
                Plan your next stay
              </h1>
              <p
                className="text-[13px] mb-6"
                style={{ color: "var(--ink-secondary)" }}
              >
                at Rosewood Sand Hill
              </p>
            </div>

            <PreFilledIntake
              prompt="What would feel right this time?"
              prefill={FALLBACK_PREFILL}
            />
          </div>
        </div>
      </main>
    </>
  );
}
