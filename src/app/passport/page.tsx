import { getState } from "@/lib/state";
import { TopBar } from "./components/TopBar";
import { TabNav } from "./components/TabNav";
import { PassportItineraryView } from "./components/PassportItineraryView";
import DemoNav from "@/components/DemoNav";

// Inject design tokens locally (globals.css is intentionally untouched for the
// hackathon scaffold). Mirrors the Departure route's approach so the Itinerary
// flow renders with the same cream surface, serif headlines, and phone-frame
// chrome as the rest of the demo.
const TOKEN_CSS = `
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
    --sage-olive: #7F8E6F;
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

export const dynamic = "force-dynamic";

export default function PassportPage() {
  const state = getState();

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
        className="flex min-h-screen w-full flex-1 items-center justify-center p-6"
        style={{
          background: "#E8E4DC",
          fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
          color: "var(--ink-primary, #1F1E1A)",
        }}
        aria-label="Passport itinerary"
      >
        <div className="phone-frame">
          <TopBar stampsEarned={state.stampsEarned} />
          <PassportItineraryView initialState={state} />
          <TabNav />
        </div>
        <DemoNav />
      </main>
    </>
  );
}
