import ChatVoiceIcon from "../../concierge/components/ChatVoiceIcon";

type Props = {
  text: string;
  voiceUrl?: string;
};

/**
 * James's farewell message — rendered in the same "incoming" bubble style used
 * in the Concierge tab: sage olive tint background, sage border at 25% alpha,
 * 16px corners except a 4px bottom-left tail. Sized to leave room for the
 * voice icon in the bottom-right corner.
 */
export default function FarewellMessage({ text, voiceUrl }: Props) {
  return (
    <div className="flex w-full">
      <div
        className="relative max-w-[85%]"
        style={{
          background: "rgba(127, 142, 111, 0.08)",
          border: "1px solid rgba(127, 142, 111, 0.25)",
          borderRadius: "16px 16px 16px 4px",
          padding: "14px 16px 28px 16px",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {text}
        <ChatVoiceIcon voiceUrl={voiceUrl} />
      </div>
    </div>
  );
}
