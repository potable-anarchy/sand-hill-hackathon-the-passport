"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType, PassportState } from "@/lib/types";
import { CONCIERGE } from "@/lib/property-catalog";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { TabNav } from "../components/TabNav";
import DemoNav from "@/components/DemoNav";

type ConciergeResponse = {
  reply: string;
  voiceUrl?: string;
  stateChanged?: boolean;
};

export default function ConciergePage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Load existing messages on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (!res.ok) return;
        const state = (await res.json()) as PassportState;
        if (!cancelled) setMessages(state.messages || []);
      } catch {
        // ignore; chat just starts empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-scroll to the bottom on new messages.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const handleSend = async (text: string) => {
    if (sending) return;

    const optimistic: ChatMessageType = {
      id: `local-${Date.now()}`,
      role: "guest",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        throw new Error(`Concierge failed: ${res.status}`);
      }
      const data = (await res.json()) as ConciergeResponse;
      const reply: ChatMessageType = {
        id: `local-${Date.now()}-c`,
        role: "concierge",
        text: data.reply,
        voiceUrl: data.voiceUrl,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (e) {
      console.error(e);
      const errReply: ChatMessageType = {
        id: `local-${Date.now()}-err`,
        role: "concierge",
        text: "Sorry — I dropped that. Try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errReply]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
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
`,
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <main
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{
          background: "#2b2620",
          fontFamily: "var(--font-sans)",
          color: "var(--ink-primary)",
        }}
      >
        <div className="phone-frame">
          {/* Header: James + role */}
          <header
            className="px-6 pt-8 pb-5"
            style={{
              borderBottom: "1px solid var(--divider)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                fontSize: 28,
                lineHeight: 1.1,
                color: "var(--ink-primary)",
                margin: 0,
              }}
            >
              {CONCIERGE.name}
            </h2>
            <div
              className="mt-1"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-tertiary)",
              }}
            >
              Your Sand Hill Concierge
            </div>
          </header>

          {/* Message list */}
          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
          >
            {messages.length === 0 ? (
              <div
                className="text-center mt-8"
                style={{
                  fontSize: 13,
                  color: "var(--ink-tertiary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Ask {CONCIERGE.name} anything — a swap, a recommendation, a
                quiet corner for dinner.
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m} />)
            )}

            {sending ? (
              <div className="w-full flex justify-start">
                <div
                  style={{
                    maxWidth: "78%",
                    background: "var(--sage-olive-tint)",
                    border: "1px solid var(--sage-olive-border)",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "12px 16px",
                    color: "var(--ink-tertiary)",
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    fontStyle: "italic",
                  }}
                >
                  …
                </div>
              </div>
            ) : null}
          </div>

          <ChatInput onSend={handleSend} disabled={sending} />
          <TabNav />
        </div>
        <DemoNav />
      </main>
    </>
  );
}
