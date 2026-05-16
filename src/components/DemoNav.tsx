"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Demo navigation overlay — visible only at the page edges, outside the
 * phone-frame mock. Lets Brad walk through the live demo without typing URLs.
 * Bound to ← and → arrow keys as well as space (forward) / backspace (back).
 *
 * Each demo page renders a single <DemoNav /> at the bottom of its tree.
 */

const STEPS = [
  { path: "/preview", label: "Intake" },
  { path: "/passport", label: "Passport" },
  { path: "/staff", label: "Staff" },
  { path: "/passport/concierge", label: "Concierge" },
  { path: "/passport/departure", label: "Departure" },
  { path: "/timeline", label: "Email drafts" },
  { path: "/preview/welcome-back", label: "Welcome back" },
];

export default function DemoNav() {
  const router = useRouter();
  const path = usePathname();
  const [resetting, setResetting] = useState(false);
  const idx = STEPS.findIndex((s) => s.path === path);
  const prev = idx > 0 ? STEPS[idx - 1] : null;
  const next = idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

  const startNewDemo = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      // Land on /preview to start the demo from the top.
      router.push("/preview");
      // Force a refresh so any cached server-component data re-fetches.
      setTimeout(() => router.refresh(), 150);
    } catch (e) {
      console.error("Demo reset failed", e);
    } finally {
      setTimeout(() => setResetting(false), 800);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const t = e.target as HTMLElement;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) {
        return;
      }
      if ((e.key === "ArrowLeft" || e.key === "Backspace") && prev) {
        e.preventDefault();
        router.push(prev.path);
      } else if ((e.key === "ArrowRight" || e.key === " ") && next) {
        e.preventDefault();
        router.push(next.path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  if (idx === -1) return null;

  return (
    <>
      <button
        type="button"
        onClick={startNewDemo}
        disabled={resetting}
        className="demo-nav-btn"
        style={startStyle}
        aria-label="Start a new demo"
      >
        <span style={chevronStyle}>↻</span>
        <span style={labelStyle}>{resetting ? "Resetting…" : "Start new demo"}</span>
      </button>
      {prev && (
        <Link href={prev.path} style={prevStyle} className="demo-nav-btn">
          <span style={chevronStyle}>←</span>
          <span style={labelStyle}>{prev.label}</span>
        </Link>
      )}
      {next && (
        <Link href={next.path} style={nextStyle} className="demo-nav-btn">
          <span style={labelStyle}>{next.label}</span>
          <span style={chevronStyle}>→</span>
        </Link>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.demo-nav-btn {
  transition: opacity 0.15s ease, background 0.15s ease;
}
.demo-nav-btn:hover {
  background: rgba(31, 30, 26, 0.92) !important;
}
`,
        }}
      />
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 100,
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  background: "rgba(31, 30, 26, 0.78)",
  color: "#FAF7F2",
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: 100,
  fontSize: 13,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  letterSpacing: "0.02em",
  fontWeight: 500,
  border: "1px solid rgba(232, 228, 220, 0.15)",
};

const prevStyle: React.CSSProperties = {
  ...btnBase,
  left: 24,
};

const nextStyle: React.CSSProperties = {
  ...btnBase,
  right: 24,
};

// "Start new demo" — sits above the right pill nav, top-right of the screen.
const startStyle: React.CSSProperties = {
  ...btnBase,
  top: 24,
  right: 24,
  transform: "none",
  background: "rgba(168, 138, 86, 0.85)", // brass accent
  border: "1px solid rgba(168, 138, 86, 0.55)",
  cursor: "pointer",
};

const chevronStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1,
  display: "inline-block",
};

const labelStyle: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontSize: 11,
};

const indicatorStyle: React.CSSProperties = {
  position: "fixed",
  top: 16,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 100,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
};

const dotsStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const dotStyle: React.CSSProperties = {
  display: "inline-block",
  height: 6,
  borderRadius: 100,
  transition: "background 0.2s ease, width 0.2s ease",
};

const stepTextStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(31, 30, 26, 0.55)",
};
