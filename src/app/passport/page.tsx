import { Cormorant_Garamond, Inter } from "next/font/google";
import { getState } from "@/lib/state";
import { TopBar } from "./components/TopBar";
import { TabNav } from "./components/TabNav";
import { PassportItineraryView } from "./components/PassportItineraryView";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

export const dynamic = "force-dynamic";

export default function PassportPage() {
  const state = getState();

  return (
    <div
      className={`${serif.variable} ${sans.variable} flex min-h-screen flex-1 items-center justify-center p-6`}
      style={{
        background: "var(--color-divider, #E8E4DC)",
        fontFamily: "var(--font-sans, 'Inter', system-ui, sans-serif)",
        // Surface design tokens locally so styles work even before globals.css
        // is updated by the design-system agent.
        ["--color-bg-cream" as string]: "#FAF7F2",
        ["--color-surface-paper" as string]: "#FCFAF6",
        ["--color-surface-white" as string]: "#FFFFFF",
        ["--color-ink-primary" as string]: "#1F1E1A",
        ["--color-ink-secondary" as string]: "#5C5953",
        ["--color-ink-tertiary" as string]: "#8E8A82",
        ["--color-accent-olive" as string]: "#7F8E6F",
        ["--color-accent-brass" as string]: "#A88A56",
        ["--color-accent-clay" as string]: "#B07A6B",
        ["--color-divider" as string]: "#E8E4DC",
      }}
    >
      <div
        className="phone-frame relative flex flex-col overflow-hidden"
        style={{
          width: "390px",
          height: "844px",
          background: "var(--color-bg-cream, #FAF7F2)",
          border: "1px solid var(--color-ink-tertiary, #8E8A82)",
          borderRadius: "36px",
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "8px",
            width: "120px",
            height: "4px",
            background: "var(--color-ink-primary, #1F1E1A)",
            opacity: 0.15,
            borderRadius: "2px",
            zIndex: 10,
          }}
        />
        <TopBar stampsEarned={state.stampsEarned} />
        <PassportItineraryView initialState={state} />
        <TabNav />
      </div>
    </div>
  );
}
