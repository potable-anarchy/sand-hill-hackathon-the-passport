"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PreviewIntake from "./components/PreviewIntake";
import PreviewItinerary from "./components/PreviewItinerary";
import type { PassportItem, GuestProfile } from "@/lib/types";

type Step = 1 | 2 | 3 | "loading" | "itinerary";

const QUESTIONS: Array<{ question: string; placeholder: string }> = [
  {
    question: "What would feel like a perfect day at Rosewood Sand Hill?",
    placeholder:
      "A slow morning, somewhere in the cypress grove, an unhurried dinner.",
  },
  {
    question: "Anything we should plan around?",
    placeholder:
      "Arriving Friday afternoon, friend joining us Saturday for dinner.",
  },
  {
    question: "Anything you'd rather not?",
    placeholder: "Nothing too early. No big group activities.",
  },
];

/**
 * Passport Preview flow.
 * 3 sequential intake prompts → POST to /api/itinerary/generate → render itinerary.
 * CTA on itinerary navigates to /passport (the post-booking home).
 *
 * Design tokens are injected inline because globals.css is intentionally untouched.
 */
export default function PreviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<[string, string, string]>(["", "", ""]);
  const [items, setItems] = useState<PassportItem[]>([]);
  const [, setGuest] = useState<GuestProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (idx: 0 | 1 | 2, v: string) =>
    setAnswers((prev) => {
      const next = [...prev] as [string, string, string];
      next[idx] = v;
      return next;
    });

  async function generate() {
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: answers }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items: PassportItem[]; guest: GuestProfile };
      setItems(data.items);
      setGuest(data.guest);
      setStep("itinerary");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep(3);
    }
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          max-height: calc(100vh - 32px);
          background: var(--bg-cream);
          border: 1px solid var(--ink-tertiary);
          border-radius: 36px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: var(--font-sans);
          color: var(--ink-primary);
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
        textarea::placeholder, input::placeholder {
          color: var(--ink-tertiary);
          opacity: 1;
        }
      `,
        }}
      />

      {/* Google Fonts for the serif + sans */}
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
        style={{ background: "#e8e4dc" }}
      >
        <div className="phone-frame">
          {step === 1 && (
            <PreviewIntake
              step={1}
              total={3}
              question={QUESTIONS[0].question}
              placeholder={QUESTIONS[0].placeholder}
              value={answers[0]}
              onChange={(v) => setAnswer(0, v)}
              onNext={() => setStep(2)}
              disabled={!answers[0].trim()}
            />
          )}

          {step === 2 && (
            <PreviewIntake
              step={2}
              total={3}
              question={QUESTIONS[1].question}
              placeholder={QUESTIONS[1].placeholder}
              value={answers[1]}
              onChange={(v) => setAnswer(1, v)}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              disabled={!answers[1].trim()}
            />
          )}

          {step === 3 && (
            <>
              <PreviewIntake
                step={3}
                total={3}
                question={QUESTIONS[2].question}
                placeholder={QUESTIONS[2].placeholder}
                value={answers[2]}
                onChange={(v) => setAnswer(2, v)}
                onNext={generate}
                onBack={() => setStep(2)}
                nextLabel="Generate →"
                disabled={!answers[2].trim()}
              />
              {error && (
                <div
                  className="absolute bottom-6 left-6 right-6 text-[12px] px-4 py-3 rounded"
                  style={{
                    background: "rgba(176, 122, 107, 0.1)",
                    border: "1px solid var(--accent-clay)",
                    color: "var(--accent-clay)",
                  }}
                >
                  Couldn&apos;t draft your stay: {error}. Tap Generate to retry.
                </div>
              )}
            </>
          )}

          {step === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div
                className="text-[24px] mb-3"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  color: "var(--ink-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Drafting your stay
              </div>
              <div
                className="text-[12px] uppercase tracking-[0.12em]"
                style={{ color: "var(--ink-tertiary)" }}
              >
                holding a few things for you
              </div>
            </div>
          )}

          {step === "itinerary" && (
            <PreviewItinerary
              items={items}
              onCommit={() => router.push("/passport")}
            />
          )}
        </div>
      </main>
    </>
  );
}
