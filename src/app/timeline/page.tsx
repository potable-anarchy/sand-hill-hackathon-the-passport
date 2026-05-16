import { getState } from "@/lib/state";
import { experienceById, EXPERIENCES } from "@/lib/property-catalog";

/**
 * Post-checkout email drafts.
 *
 * Two AI-drafted outreach emails James is preparing for review:
 *   1. Warm closure email referencing a photo the guest took (something they
 *      attended).
 *   2. Re-pitch email for something they missed — surfaced forward, never as
 *      "you skipped".
 *
 * Both emails pull real demo state where available and fall back to a
 * plausible Sand Hill scenario otherwise.
 */
export default function EmailDraftsPage() {
  const state = getState();
  const guestName = state.guest.name;
  const firstName = guestName.split(" ")[0] || guestName;

  // Pick a photo + the experience it was for (or fallback).
  const photo = state.photos[0];
  const photoExp = photo?.itemId
    ? experienceById(
        state.items.find((i) => i.id === photo.itemId)?.experienceId ?? "",
      )
    : null;
  const attendedExp =
    photoExp ||
    experienceById(
      state.items.find((i) => i.state === "stamped")?.experienceId ?? "",
    ) ||
    experienceById("madera-tasting")!;

  // Pick a banked experience to re-pitch (or fallback).
  const bankedExp =
    experienceById(
      state.items.find((i) => i.state === "banked")?.experienceId ?? "",
    ) || experienceById("ridge-rose-reveal")!;

  const photoSrc = photo?.url ?? null;

  return (
    <>
      <Tokens />
      <FontLink />
      <main style={pageStyle}>
        <div className="phone-frame">
          <div style={topbarStyle}>
            <div style={wordmarkStyle}>the passport</div>
            <div style={lowerCaseGuest}>
              outbound · {firstName.toLowerCase()}
            </div>
          </div>

          <div style={scrollStyle}>
            <h1 style={headlineStyle}>What we'll send</h1>
            <p style={subStyle}>
              Two drafts. James writes, the front office reviews, the guest
              never sees a template.
            </p>

            <EmailDraft
              when="Day 14 · May 30"
              from={`James · Rosewood Sand Hill`}
              subject={`Thinking of you, ${firstName}.`}
              photoSrc={photoSrc}
              photoAlt={`Your ${attendedExp.name}`}
            >
              <p style={paraStyle}>
                The light you caught at {attendedExp.location.toLowerCase()} —
                Reni asked me when you're back. He's already plating the next
                tasting.
              </p>
              <p style={paraStyle}>
                His summer menu drops the second week of July. The same corner
                table is yours if you want it. I'd hold the same Ridge
                pairing.
              </p>
              <p style={signoffStyle}>— James</p>
            </EmailDraft>

            <EmailDraft
              when="Day 90 · Aug 14"
              from={`James · Rosewood Sand Hill`}
              subject={`${bankedExp.name} — held for you.`}
            >
              <p style={paraStyle}>
                We saved {bankedExp.name.toLowerCase().replace(/^the /, "")}{" "}
                for you when {bankedShortAction(bankedExp.id)}.
              </p>
              <p style={paraStyle}>
                It's back this September, here at Sand Hill. I'd hold you a
                seat where the cypress break the late afternoon light.
              </p>
              <p style={paraStyle}>
                Reply <em>yes</em> and I'll close the calendar with you.
              </p>
              <p style={signoffStyle}>— James</p>
            </EmailDraft>

            <p style={footerHintStyle}>
              The rest of the year is quiet. We send a third around your
              anniversary if there's a reason to.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function bankedShortAction(expId: string): string {
  // Tiny tone-tweak so the line doesn't read mechanical.
  if (expId === "ridge-rose-reveal") return "you took the slower path";
  if (expId === "cycling-concierge")
    return "the morning ran longer than the road";
  if (expId === "asaya-spa") return "the timing didn't land";
  return "the timing didn't land";
}

// ─── Email card ─────────────────────────────────────────────────────────────

function EmailDraft({
  when,
  from,
  subject,
  photoSrc,
  photoAlt,
  children,
}: {
  when: string;
  from: string;
  subject: string;
  photoSrc?: string | null;
  photoAlt?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={cardStyle}>
      <div style={cardWhenStyle}>{when}</div>
      <div style={cardSubjectStyle}>{subject}</div>
      <div style={cardFromStyle}>{from}</div>

      {photoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoSrc} alt={photoAlt || "memory"} style={photoStyle} />
      ) : photoAlt ? (
        <div style={photoPlaceholderStyle}>
          <span>YOUR PHOTO — {photoAlt.toUpperCase()}</span>
        </div>
      ) : null}

      <div style={bodyStyle}>{children}</div>
    </div>
  );
}

// ─── Style helpers ──────────────────────────────────────────────────────────

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

const lowerCaseGuest: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
};

const scrollStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "20px 20px 32px",
};

const headlineStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 30,
  fontWeight: 400,
  letterSpacing: "-0.01em",
  marginBottom: 6,
  color: "var(--ink-primary)",
};

const subStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--ink-secondary)",
  marginBottom: 24,
  lineHeight: 1.5,
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface-white)",
  border: "1px solid var(--divider)",
  borderRadius: 12,
  padding: 18,
  marginBottom: 16,
};

const cardWhenStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ink-tertiary)",
  marginBottom: 8,
};

const cardSubjectStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  lineHeight: 1.3,
  color: "var(--ink-primary)",
  marginBottom: 4,
};

const cardFromStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ink-tertiary)",
  marginBottom: 14,
};

const photoStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  aspectRatio: "4/5",
  objectFit: "cover",
  borderRadius: 6,
  marginBottom: 14,
};

const photoPlaceholderStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "4/5",
  background:
    "linear-gradient(135deg, #c9a878 0%, #7d8466 100%)",
  borderRadius: 6,
  marginBottom: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.6)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textAlign: "center",
  padding: 12,
};

const bodyStyle: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.6,
  color: "var(--ink-primary)",
};

const paraStyle: React.CSSProperties = {
  margin: "0 0 10px 0",
};

const signoffStyle: React.CSSProperties = {
  marginTop: 14,
  fontSize: 13,
  color: "var(--ink-secondary)",
};

const footerHintStyle: React.CSSProperties = {
  marginTop: 8,
  textAlign: "center",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
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
