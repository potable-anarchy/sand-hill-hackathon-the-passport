"use client";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function PhotoAlbumCard({ onClick, disabled }: Props) {
  return (
    <article
      className="mb-4 rounded-[12px] border p-5"
      style={{
        background: "var(--surface-paper, #FCFAF6)",
        borderColor: "var(--accent-brass, #A88A56)",
      }}
    >
      <h3
        className="text-[19px] leading-tight"
        style={{
          fontFamily:
            "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
          color: "var(--accent-brass, #A88A56)",
          fontWeight: 400,
        }}
      >
        ◇ Save a memory
      </h3>
      <p
        className="mt-1 text-[13px]"
        style={{ color: "var(--ink-secondary, #5C5953)" }}
      >
        Share a photo. Unlocks a bar visit tonight.
      </p>
      <div className="mt-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="text-[13px] font-medium disabled:opacity-50"
          style={{ color: "var(--accent-brass, #A88A56)" }}
        >
          Add photo ↗
        </button>
      </div>
    </article>
  );
}
