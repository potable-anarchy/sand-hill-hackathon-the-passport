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
    <div
      className="flex flex-col flex-1 min-h-screen"
      style={{ background: "var(--bg-cream, #f3eee5)" }}
    >
      {/* Header: James + role */}
      <header
        className="px-6 pt-8 pb-5"
        style={{
          borderBottom: "1px solid var(--divider, rgba(42, 42, 40, 0.08))",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            fontSize: 28,
            lineHeight: 1.1,
            color: "var(--ink-primary, #2a2a28)",
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
            color: "var(--ink-tertiary, #98948c)",
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
              color: "var(--ink-tertiary, #98948c)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Ask {CONCIERGE.name} anything — a swap, a recommendation, a quiet
            corner for dinner.
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}

        {sending ? (
          <div className="w-full flex justify-start">
            <div
              style={{
                maxWidth: "78%",
                background: "var(--sage-olive-tint, rgba(127, 142, 111, 0.1))",
                border:
                  "1px solid var(--sage-olive-border, rgba(127, 142, 111, 0.25))",
                borderRadius: "16px 16px 16px 4px",
                padding: "12px 16px",
                color: "var(--ink-tertiary, #98948c)",
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
      <DemoNav />
    </div>
  );
}
