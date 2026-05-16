"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { experienceById } from "@/lib/property-catalog";
import type { PassportItem, ChatMessage as ChatMessageType } from "@/lib/types";
import ChatMessage from "../passport/concierge/components/ChatMessage";
import ChatInput from "../passport/concierge/components/ChatInput";

const Q1 = "Welcome to Sand Hill. Tell me — what would feel like a perfect day here?";
const Q2 = "And anything we should plan around — work, jet lag, anything specific?";
const Q3 = "Last one: anything you'd rather we leave off?";

const QUESTIONS = [Q1, Q2, Q3];

type Stage = "asking" | "generating" | "presented";

export default function PreviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [stage, setStage] = useState<Stage>("asking");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [items, setItems] = useState<PassportItem[]>([]);
  const [typing, setTyping] = useState(false);
  const streamRef = useRef<HTMLDivElement | null>(null);

  // Open with James's first question (after a brief beat so user sees the screen first).
  useEffect(() => {
    let mounted = true;
    (async () => {
      await sleep(500);
      if (!mounted) return;
      setTyping(true);
      await sleep(900);
      if (!mounted) return;
      setTyping(false);
      setMessages([
        {
          id: "intake-q-0",
          role: "concierge",
          text: Q1,
          timestamp: new Date().toISOString(),
        },
      ]);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages, items, typing]);

  // Helper: show typing indicator for a beat, then append a James message.
  const sayAfterTyping = async (
    id: string,
    text: string,
    typingMs = 1000,
  ) => {
    setTyping(true);
    await sleep(typingMs);
    setTyping(false);
    await sleep(80);
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "concierge",
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (text: string) => {
    if (stage !== "asking") return;

    const guestMsg: ChatMessageType = {
      id: `intake-a-${step}`,
      role: "guest",
      text,
      timestamp: new Date().toISOString(),
    };
    const nextAnswers = [...answers, text];
    setMessages((prev) => [...prev, guestMsg]);
    setAnswers(nextAnswers);

    const nextStep = step + 1;

    if (nextStep < QUESTIONS.length) {
      // Pause so user's own message has a beat to land, then James "types" the next question.
      await sleep(600);
      await sayAfterTyping(`intake-q-${nextStep}`, QUESTIONS[nextStep], 1100);
      setStep(nextStep);
    } else {
      // All 3 answered — drafting + present.
      setStage("generating");
      await sleep(700);
      await sayAfterTyping(
        "intake-drafting",
        "One moment — drafting your stay.",
        900,
      );

      // Hold the drafting message + run the API call in parallel.
      const minDraftingDisplayMs = 2200;
      const start = Date.now();
      let items: PassportItem[] = [];
      let didError = false;
      try {
        const res = await fetch("/api/itinerary/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompts: nextAnswers, guestName: "Marcie" }),
        });
        const data = (await res.json()) as { items: PassportItem[] };
        items = data.items;
      } catch {
        didError = true;
      }
      const elapsed = Date.now() - start;
      if (elapsed < minDraftingDisplayMs) {
        await sleep(minDraftingDisplayMs - elapsed);
      }

      if (didError) {
        await sayAfterTyping(
          "intake-error",
          "Hm — give me a moment, I'm having trouble reaching the catalog.",
          800,
        );
        setStage("asking");
        return;
      }

      setItems(items);
      // Brief pause after drafting, then the itinerary card appears.
      await sleep(300);
      setStage("presented");
    }
  };

  return (
    <div style={pageStyle}>
      <FontLink />
      <Tokens />
      <div className="phone-frame">
        <div style={topbarStyle}>
          <span style={wordmarkStyle}>the passport</span>
        </div>

        <div style={chatHeaderStyle}>
          <h2 style={chatHeaderName}>James</h2>
          <div style={chatHeaderRole}>YOUR SAND HILL CONCIERGE</div>
        </div>

        <div ref={streamRef} style={streamStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {typing && <TypingBubble />}
            {stage === "presented" && items.length > 0 && (
              <ItineraryInChat items={items} onBook={() => router.push("/passport")} />
            )}
          </div>
        </div>

        {stage !== "presented" && (
          <ChatInput
            onSend={handleSend}
            disabled={stage === "generating" || typing || messages.length === 0}
          />
        )}
      </div>
    </div>
  );
}

function ItineraryInChat({
  items,
  onBook,
}: {
  items: PassportItem[];
  onBook: () => void;
}) {
  return (
    <div style={itineraryCardStyle}>
      <div style={itineraryHeader}>
        <span style={itineraryHeadline}>Your stay, drafted</span>
        <span style={itineraryHeldFor}>held for the next 48 hours</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((it) => {
          const exp = experienceById(it.experienceId);
          if (!exp) return null;
          return (
            <div key={it.id} style={itineraryItemStyle}>
              <div style={itineraryRow}>
                <span style={itinerarySlot}>{it.slot}</span>
                <span style={itineraryName}>{exp.name}</span>
              </div>
              <div style={unlockPill}>◇ {exp.unlock}</div>
            </div>
          );
        })}
      </div>
      <button onClick={onBook} style={bookButtonStyle}>
        Add dates and book →
      </button>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function TypingBubble() {
  return (
    <div className="w-full flex flex-col items-start">
      <div
        style={{
          background: "var(--sage-olive-tint, rgba(127, 142, 111, 0.1))",
          border: "1px solid var(--sage-olive-border, rgba(127, 142, 111, 0.25))",
          borderRadius: "16px 16px 16px 4px",
          padding: "14px 18px",
          color: "var(--ink-tertiary, #8E8A82)",
          fontFamily: "var(--font-sans)",
          fontSize: 18,
          letterSpacing: 4,
          lineHeight: 1,
          display: "inline-flex",
          gap: 0,
        }}
      >
        <Dot delay="0s" />
        <Dot delay="0.18s" />
        <Dot delay="0.36s" />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes pulseDot {
  0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-2px); }
}
.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 0 2px;
  border-radius: 50%;
  background: var(--ink-tertiary, #8E8A82);
  animation: pulseDot 1.2s ease-in-out infinite;
  opacity: 0.25;
}
`,
        }}
      />
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="typing-dot" style={{ animationDelay: delay }} />;
}

// ─── Styles ────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg-cream, #FAF7F2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const topbarStyle: React.CSSProperties = {
  padding: "32px 24px 16px",
  borderBottom: "1px solid var(--divider, #E8E4DC)",
};

const wordmarkStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 18,
  color: "var(--ink-primary, #1F1E1A)",
};

const chatHeaderStyle: React.CSSProperties = {
  padding: "16px 24px 12px",
  borderBottom: "1px solid var(--divider, #E8E4DC)",
};

const chatHeaderName: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 22,
  color: "var(--ink-primary, #1F1E1A)",
  margin: 0,
};

const chatHeaderRole: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  color: "var(--ink-tertiary, #8E8A82)",
  marginTop: 2,
  textTransform: "uppercase",
};

const streamStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "16px 20px",
};

const itineraryCardStyle: React.CSSProperties = {
  background: "var(--surface-white, #ffffff)",
  border: "1px solid var(--divider, #E8E4DC)",
  borderRadius: 12,
  padding: 20,
  marginTop: 4,
};

const itineraryHeader: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: "1px solid var(--divider, #E8E4DC)",
};

const itineraryHeadline: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 20,
  color: "var(--ink-primary, #1F1E1A)",
};

const itineraryHeldFor: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  color: "var(--ink-tertiary, #8E8A82)",
  textTransform: "uppercase",
  marginTop: 4,
};

const itineraryItemStyle: React.CSSProperties = {
  paddingBottom: 12,
  borderBottom: "1px solid var(--divider, #E8E4DC)",
};

const itineraryRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  marginBottom: 6,
};

const itinerarySlot: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.08em",
  color: "var(--ink-tertiary, #8E8A82)",
  textTransform: "uppercase",
  minWidth: 78,
  flexShrink: 0,
};

const itineraryName: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  color: "var(--ink-primary, #1F1E1A)",
  lineHeight: 1.2,
};

const unlockPill: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(127, 142, 111, 0.12)",
  color: "var(--sage-olive, #7F8E6F)",
  fontSize: 12,
  padding: "3px 10px",
  borderRadius: 100,
  letterSpacing: "0.02em",
  marginLeft: 90,
};

const bookButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 20,
  padding: "14px",
  background: "var(--ink-primary, #1F1E1A)",
  color: "var(--bg-cream, #FAF7F2)",
  border: "none",
  borderRadius: 2,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.02em",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

function Tokens() {
  return <style dangerouslySetInnerHTML={{ __html: TOKENS_CSS }} />;
}

const TOKENS_CSS = `
:root {
  --bg-cream: #FAF7F2;
  --surface-paper: #FCFAF6;
  --surface-white: #FFFFFF;
  --ink-primary: #1F1E1A;
  --ink-secondary: #5C5953;
  --ink-tertiary: #8E8A82;
  --sage-olive: #7F8E6F;
  --sage-olive-tint: rgba(127, 142, 111, 0.1);
  --sage-olive-border: rgba(127, 142, 111, 0.25);
  --accent-brass: #A88A56;
  --accent-clay: #B07A6B;
  --divider: #E8E4DC;
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", -apple-system, system-ui, sans-serif;
}
.phone-frame {
  width: 390px;
  height: 844px;
  background: var(--bg-cream);
  border: 1px solid var(--ink-tertiary);
  border-radius: 36px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
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
  z-index: 50;
}
`;

function FontLink() {
  return (
    // eslint-disable-next-line @next/next/no-page-custom-font
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap"
    />
  );
}
