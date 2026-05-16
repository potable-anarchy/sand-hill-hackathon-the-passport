"use client";

import { useMemo } from "react";
import { experienceById, type Experience } from "@/lib/property-catalog";
import type { PassportItem } from "@/lib/types";

type Props = {
  items: PassportItem[];
  onCommit: () => void;
};

type TimeOfDay = "morning" | "afternoon" | "evening";

function timeOfDay(slot: string): TimeOfDay {
  // Slots look like "Fri 6:30pm" or "Sat 7:00am".
  const m = slot.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
  if (!m) return "afternoon";
  let hour = parseInt(m[1], 10);
  const meridiem = m[3].toLowerCase();
  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour < 11) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const ORDER: TimeOfDay[] = ["morning", "afternoon", "evening"];

/**
 * Renders the generated itinerary preview: cards grouped by time-of-day,
 * each with name, location, description, and a sage olive unlock pill.
 * A primary CTA at the bottom proceeds to the booked Passport view.
 */
export default function PreviewItinerary({ items, onCommit }: Props) {
  const grouped = useMemo(() => {
    const byTod: Record<TimeOfDay, Array<{ item: PassportItem; exp: Experience }>> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const item of items) {
      const exp = experienceById(item.experienceId);
      if (!exp) continue;
      byTod[timeOfDay(item.slot)].push({ item, exp });
    }
    return byTod;
  }, [items]);

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-baseline justify-between px-6 pt-8 pb-4 border-b border-[color:var(--divider)]">
        <div
          className="text-[18px]"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            color: "var(--ink-primary)",
          }}
        >
          the passport
        </div>
        <div />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        <h1
          className="text-[32px] leading-[1.15] mb-1"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            color: "var(--ink-primary)",
          }}
        >
          Your stay, drafted
        </h1>
        <p
          className="text-[13px] mb-6"
          style={{ color: "var(--ink-secondary)" }}
        >
          Held for the next 48 hours
        </p>

        {ORDER.map((tod) => {
          const entries = grouped[tod];
          if (!entries.length) return null;
          return entries.map(({ item, exp }, idx) => {
            const alternateNames = item.alternates
              .map((id) => experienceById(id)?.name)
              .filter(Boolean) as string[];

            return (
              <article
                key={item.id || `${tod}-${idx}-${exp.id}`}
                className="rounded-[12px] p-5 mb-4"
                style={{
                  background: "var(--surface-white)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.08em] mb-2"
                  style={{ color: "var(--ink-tertiary)" }}
                >
                  {tod}
                </div>
                <h2
                  className="text-[19px] mb-1"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 400,
                    color: "var(--ink-primary)",
                  }}
                >
                  {exp.name}
                </h2>
                <div
                  className="text-[13px] mb-3"
                  style={{ color: "var(--ink-secondary)" }}
                >
                  {exp.location} · {exp.description}
                </div>
                <span
                  className="inline-block text-[12px] tracking-[0.02em] px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(127, 142, 111, 0.12)",
                    color: "var(--accent-olive)",
                  }}
                >
                  ◇ {exp.unlock}
                </span>
                {alternateNames.length > 0 && (
                  <div
                    className="mt-2 text-[11px] italic"
                    style={{ color: "var(--ink-tertiary)" }}
                  >
                    Also held: {alternateNames.join(", ")}
                  </div>
                )}
              </article>
            );
          });
        })}

        <button
          onClick={onCommit}
          className="w-full py-4 mt-6 text-[14px] font-medium tracking-[0.02em] rounded-[2px]"
          style={{
            background: "var(--ink-primary)",
            color: "var(--bg-cream)",
          }}
        >
          Add dates and book →
        </button>
      </div>
    </div>
  );
}
