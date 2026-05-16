"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/types";
import ChatVoiceIcon from "./ChatVoiceIcon";

type Props = {
  message: ChatMessageType;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * A single chat bubble.
 * - `concierge` (James) → sage-olive tinted bubble, left-aligned, with an
 *   optional voice play icon docked bottom-right.
 * - `guest` → white bubble, hairline border, right-aligned.
 */
export default function ChatMessage({ message }: Props) {
  const isConcierge = message.role === "concierge";
  const time = formatTime(message.timestamp);

  if (isConcierge) {
    return (
      <div className="w-full flex flex-col items-start">
        <div
          className="relative"
          style={{
            maxWidth: "78%",
            background: "var(--sage-olive-tint, rgba(127, 142, 111, 0.1))",
            border:
              "1px solid var(--sage-olive-border, rgba(127, 142, 111, 0.25))",
            borderRadius: "16px 16px 16px 4px",
            padding: "12px 36px 12px 16px",
            color: "var(--ink-primary, #2a2a28)",
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            lineHeight: 1.45,
          }}
        >
          {message.text}
          <ChatVoiceIcon voiceUrl={message.voiceUrl} />
        </div>
        {time ? (
          <div
            className="mt-1 ml-1"
            style={{
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--ink-tertiary, #98948c)",
            }}
          >
            {time}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-end">
      <div
        style={{
          maxWidth: "78%",
          background: "var(--surface-white, #ffffff)",
          border: "1px solid var(--divider, rgba(42, 42, 40, 0.08))",
          borderRadius: "16px 16px 4px 16px",
          padding: "12px 16px",
          color: "var(--ink-primary, #2a2a28)",
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          lineHeight: 1.45,
        }}
      >
        {message.text}
      </div>
      {time ? (
        <div
          className="mt-1 mr-1"
          style={{
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--ink-tertiary, #98948c)",
          }}
        >
          {time}
        </div>
      ) : null}
    </div>
  );
}
