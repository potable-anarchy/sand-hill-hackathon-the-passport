import Link from "next/link";
import { getState } from "@/lib/state";
import { CONCIERGE, experienceById, EXPERIENCES } from "@/lib/property-catalog";
import type { StaffObservation } from "@/lib/types";
import WelcomeBackBanner from "./components/WelcomeBackBanner";

const FALLBACK_CALLBACK = (concierge: string) =>
  `${concierge} remembered your sister's wedding in Sonoma — Hong Kong has a quiet terrace for the rehearsal dinner if you'd like.`;

function buildCallback(
  observations: StaffObservation[],
  concierge: string,
): string {
  for (const obs of observations) {
    const lowerText = obs.text.toLowerCase();
    if (lowerText.includes("sonoma") || lowerText.includes("wedding")) {
      return `${concierge} remembered what you mentioned about ${
        lowerText.includes("sonoma") ? "Sonoma" : "the wedding"
      } — we held a thought for it.`;
    }
  }
  return FALLBACK_CALLBACK(concierge);
}

/**
 * Loop-close — the demo's coup de grâce.
 *
 * Highlights three things and one ask:
 *   1. What you loved (stamped experiences + photos from last stay)
 *   2. What we saved for you (banked experiences — re-offered, never "you skipped")
 *   3. Something new since you left
 *   4. CTA: pick up the passport with James
 */
export default function WelcomeBackPage() {
  const state = getState();
  const guestName = state.guest.name;
  const firstName = guestName.split(" ")[0] || guestName;
  const callback = buildCallback(state.guest.observations, CONCIERGE.name);

  // Things they did
  const stampedItems = state.items.filter((i) => i.state === "stamped");
  const stamped = stampedItems
    .map((i) => ({ item: i, exp: experienceById(i.experienceId) }))
    .filter((x) => x.exp);
  const photos = state.photos;

  // Things they missed
  const bankedItems = state.items.filter((i) => i.state === "banked");
  const banked = bankedItems
    .map((i) => experienceById(i.experienceId))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // Fallbacks so the demo always lands
  const lovedFallback = [
    experienceById("madera-tasting"),
    experienceById("bici-coffee"),
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));
  const savedFallback = experienceById("ridge-rose-reveal");

  const showStamped = stamped.length > 0 ? stamped : lovedFallback.map((exp) => ({ item: null, exp }));
  const showBanked = banked.length > 0 ? banked : savedFallback ? [savedFallback] : [];

  // Something new since their last visit — pick one they haven't seen
  const allIds = new Set(state.items.map((i) => i.experienceId));
  const newOffering =
    EXPERIENCES.find((e) => !allIds.has(e.id) && e.id === "clubhouse-perfumer") ||
    EXPERIENCES.find((e) => !allIds.has(e.id)) ||
    experienceById("clubhouse-perfumer")!;

  return (
    <>
      <Tokens />
      <FontLink />
      <main style={pageStyle}>
        <div className="phone-frame">
          {/* TopBar */}
          <div style={topbarStyle}>
            <div style={wordmarkStyle}>the passport</div>
            <div style={guestNameStyle}>{firstName.toLowerCase()}</div>
          </div>

          {/* Content */}
          <div style={scrollStyle}>
            <WelcomeBackBanner guestName={guestName} message={callback} />

            {/* Section 1: What you loved */}
            <SectionLabel>What you loved last time</SectionLabel>
            <div style={cardsRow}>
              {showStamped.slice(0, 2).map(({ item, exp }, idx) => {
                if (!exp) return null;
                const photo = item ? photos.find((p) => p.itemId === item.id) : null;
                return (
                  <div key={`loved-${idx}`} style={lovedCard}>
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={exp.name}
                        style={lovedPhotoStyle}
                      />
                    ) : (
                      <div style={lovedPhotoPlaceholder}>
                        <span>{exp.location.toUpperCase()}</span>
                      </div>
                    )}
                    <div style={lovedName}>{exp.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Section 2: Saved for you */}
            {showBanked.length > 0 && (
              <>
                <SectionLabel>We saved this for you</SectionLabel>
                {showBanked.slice(0, 2).map((exp) => (
                  <div key={`saved-${exp.id}`} style={savedCard}>
                    <div style={savedName}>{exp.name}</div>
                    <div style={savedUnlock}>◇ {exp.unlock}</div>
                  </div>
                ))}
              </>
            )}

            {/* Section 3: New since you left */}
            <SectionLabel>New since you left</SectionLabel>
            <div style={newCard}>
              <div style={newName}>{newOffering.name}</div>
              <div style={newDesc}>{newOffering.description}</div>
              <div style={newUnlock}>◇ {newOffering.unlock}</div>
            </div>

            {/* CTA */}
            <Link href="/preview" style={ctaStyle}>
              Pick up where you left off →
            </Link>
            <div style={ctaCaption}>James will hold whatever you choose.</div>
          </div>
        </div>
      </main>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={sectionLabelStyle}>{children}</div>;
}

// ─── Styles ────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#E8E4DC",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  fontFamily: "var(--font-sans)",
  color: "var(--ink-primary)",
};

const topbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  padding: "32px 24px 16px",
  borderBottom: "1px solid var(--divider)",
};

const wordmarkStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  color: "var(--ink-primary)",
};

const guestNameStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
};

const scrollStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "20px 20px 28px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
  marginTop: 24,
  marginBottom: 12,
};

const cardsRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const lovedCard: React.CSSProperties = {
  background: "var(--surface-white)",
  border: "1px solid var(--divider)",
  borderRadius: 10,
  overflow: "hidden",
};

const lovedPhotoStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  aspectRatio: "1/1",
  objectFit: "cover",
};

const lovedPhotoPlaceholder: React.CSSProperties = {
  width: "100%",
  aspectRatio: "1/1",
  background:
    "linear-gradient(135deg, #c9a878 0%, #7d8466 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.7)",
  fontSize: 9,
  letterSpacing: "0.1em",
  textAlign: "center",
  padding: 8,
};

const lovedName: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 13,
  padding: "8px 10px 10px",
  color: "var(--ink-primary)",
  lineHeight: 1.2,
};

const savedCard: React.CSSProperties = {
  background: "var(--surface-white)",
  border: "1px solid var(--divider)",
  borderLeft: "3px solid var(--accent-clay)",
  borderRadius: 8,
  padding: 14,
  marginBottom: 8,
};

const savedName: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  color: "var(--ink-primary)",
  marginBottom: 4,
};

const savedUnlock: React.CSSProperties = {
  fontSize: 12,
  color: "var(--accent-clay)",
  letterSpacing: "0.02em",
};

const newCard: React.CSSProperties = {
  background: "var(--surface-white)",
  border: "1px solid var(--divider)",
  borderLeft: "3px solid var(--accent-brass)",
  borderRadius: 8,
  padding: 14,
};

const newName: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 16,
  color: "var(--ink-primary)",
  marginBottom: 4,
};

const newDesc: React.CSSProperties = {
  fontSize: 12,
  color: "var(--ink-secondary)",
  marginBottom: 8,
};

const newUnlock: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(168, 138, 86, 0.12)",
  color: "var(--accent-brass)",
  fontSize: 11,
  padding: "3px 10px",
  borderRadius: 100,
  letterSpacing: "0.02em",
};

const ctaStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 28,
  padding: "16px",
  background: "var(--ink-primary)",
  color: "var(--bg-cream)",
  textAlign: "center",
  textDecoration: "none",
  borderRadius: 2,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.02em",
  fontFamily: "var(--font-sans)",
};

const ctaCaption: React.CSSProperties = {
  marginTop: 10,
  textAlign: "center",
  fontSize: 11,
  letterSpacing: "0.04em",
  color: "var(--ink-tertiary)",
};

function Tokens() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
:root {
  --bg-cream: #FAF7F2;
  --surface-paper: #FCFAF6;
  --surface-white: #FFFFFF;
  --ink-primary: #1F1E1A;
  --ink-secondary: #5C5953;
  --ink-tertiary: #8E8A82;
  --accent-olive: #7F8E6F;
  --accent-brass: #A88A56;
  --accent-clay: #B07A6B;
  --divider: #E8E4DC;
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
`,
      }}
    />
  );
}

function FontLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
