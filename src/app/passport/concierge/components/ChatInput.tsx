"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

/**
 * Bottom-pinned chat composer: white pill input + dark circular send button.
 */
export default function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !disabled;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 px-4 py-3"
      style={{
        background: "var(--bg-cream, #f3eee5)",
        borderTop: "1px solid var(--divider, rgba(42, 42, 40, 0.08))",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Message James"
        disabled={disabled}
        className="flex-1 outline-none"
        style={{
          background: "var(--surface-white, #ffffff)",
          border: "1px solid var(--divider, rgba(42, 42, 40, 0.08))",
          borderRadius: 999,
          padding: "10px 16px",
          fontSize: 15,
          color: "var(--ink-primary, #2a2a28)",
          fontFamily: "var(--font-sans)",
        }}
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="flex items-center justify-center rounded-full transition-opacity"
        style={{
          width: 40,
          height: 40,
          background: "var(--ink-primary, #2a2a28)",
          color: "var(--bg-cream, #f3eee5)",
          opacity: canSend ? 1 : 0.4,
          cursor: canSend ? "pointer" : "default",
          border: "none",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 8 L13 8" />
          <path d="M8.5 3.5 L13 8 L8.5 12.5" />
        </svg>
      </button>
    </form>
  );
}
