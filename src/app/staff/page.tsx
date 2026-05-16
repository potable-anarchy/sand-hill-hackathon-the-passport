"use client";

import { useEffect, useState } from "react";
import type { PassportState, PassportItem, StaffObservation } from "@/lib/types";
import { experienceById, CONCIERGE } from "@/lib/property-catalog";
import DemoNav from "@/components/DemoNav";

type FeedRow = {
  id: string;
  who: string;
  what: string;
  status: "stamped" | "missed" | "photo";
  detail: string;
  when: string;
};

function feedFromState(state: PassportState): FeedRow[] {
  const rows: FeedRow[] = [];
  for (const item of state.items) {
    if (!item.redeemedAt) continue;
    const exp = experienceById(item.experienceId);
    if (!exp) continue;
    const when = new Date(item.redeemedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    rows.push({
      id: item.id,
      who: state.guest.name,
      what: `${exp.name} · ${item.slot}`,
      status: item.state === "stamped" ? "stamped" : "missed",
      detail: item.state === "stamped" ? `— ${exp.unlock}` : `— ${exp.unlock} banked to next stay`,
      when,
    });
  }
  // Add photo uploads
  for (const photo of state.photos) {
    rows.push({
      id: photo.id,
      who: state.guest.name,
      what: "Saved a memory",
      status: "photo",
      detail: "— bar visit unlocked",
      when: new Date(photo.uploadedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    });
  }
  return rows.reverse();
}

export default function StaffPage() {
  const [state, setState] = useState<PassportState | null>(null);
  const [obsText, setObsText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    const data = (await res.json()) as PassportState;
    setState(data);
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 2000);
    return () => clearInterval(i);
  }, []);

  const submitObservation = async () => {
    if (!obsText.trim() || submitting) return;
    setSubmitting(true);
    await fetch("/api/observation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: obsText, staffMember: "Front Desk" }),
    });
    setObsText("");
    setSubmitting(false);
    refresh();
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-cream)] flex items-center justify-center">
        <div className="text-[var(--color-ink-tertiary)]">Loading…</div>
      </div>
    );
  }

  const feed = feedFromState(state);
  const observations = state.guest.observations;

  return (
    <div className="min-h-screen bg-[var(--color-bg-cream)] py-8 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-baseline pb-4 border-b border-[var(--color-divider)] mb-8">
          <div>
            <div className="font-[var(--font-serif)] text-2xl">the passport · staff</div>
            <div className="text-[11px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mt-1">
              Sat May 16
            </div>
          </div>
          <div className="flex border border-[var(--color-divider)] rounded-full p-0.5 bg-white">
            <a
              href="/passport"
              className="px-3 py-1 text-xs text-[var(--color-ink-tertiary)] rounded-full"
            >
              📱 Guest
            </a>
            <span className="px-3 py-1 text-xs bg-[var(--color-ink-primary)] text-[var(--color-bg-cream)] rounded-full">
              📋 Staff
            </span>
          </div>
        </div>

        {/* Layout: 2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: observation input + live feed */}
          <div className="md:col-span-2">
            {/* Observation input */}
            <div className="bg-white border border-[var(--color-divider)] rounded-lg p-5 mb-8">
              <label className="block text-[11px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-3">
                Add an observation
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitObservation()}
                  placeholder="Marcie mentioned her sister's wedding in Sonoma next May."
                  className="flex-1 px-4 py-2.5 border border-[var(--color-divider)] rounded-full text-sm bg-white focus:outline-none focus:border-[var(--color-accent-olive)]"
                />
                <button
                  onClick={submitObservation}
                  disabled={submitting || !obsText.trim()}
                  className="w-10 h-10 bg-[var(--color-ink-primary)] text-[var(--color-bg-cream)] rounded-full disabled:opacity-30 cursor-pointer"
                >
                  ↑
                </button>
              </div>
              <div className="text-[11px] text-[var(--color-ink-tertiary)] mt-2">
                Guest: {state.guest.name}
              </div>
            </div>

            {/* Live feed */}
            <div className="text-[11px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-3">
              Live today
            </div>
            {feed.length === 0 ? (
              <div className="text-[var(--color-ink-tertiary)] text-sm italic">
                No activity yet. Stamps will appear here as guests redeem.
              </div>
            ) : (
              feed.map((row) => (
                <div
                  key={row.id}
                  className="bg-white border border-[var(--color-divider)] rounded-lg p-4 mb-2 flex justify-between items-center"
                >
                  <div>
                    <div className="font-[var(--font-serif)] text-base">⌘ {row.who}</div>
                    <div className="text-xs text-[var(--color-ink-secondary)] mt-0.5">
                      {row.what}
                    </div>
                    <div
                      className={`text-[11px] mt-1 ${row.status === "missed" ? "text-[var(--color-accent-clay)]" : "text-[var(--color-accent-olive)]"}`}
                    >
                      {row.detail}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[11px] uppercase tracking-wide ${row.status === "missed" ? "text-[var(--color-accent-clay)]" : "text-[var(--color-accent-olive)]"}`}
                    >
                      {row.status === "stamped"
                        ? "stamp earned"
                        : row.status === "photo"
                          ? "photo uploaded"
                          : "missed"}
                    </div>
                    <div className="text-[10px] text-[var(--color-ink-tertiary)] mt-0.5">
                      {row.when}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: profile side panel */}
          <div>
            <div className="text-[11px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-3">
              {state.guest.name}'s profile
            </div>
            <div className="bg-white border border-[var(--color-divider)] rounded-lg p-5">
              {state.guest.statedIntent.length > 0 && (
                <>
                  <div className="text-[10px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2">
                    Stated intent
                  </div>
                  {state.guest.statedIntent.map((intent, i) =>
                    intent ? (
                      <div
                        key={i}
                        className="text-[13px] text-[var(--color-ink-secondary)] italic mb-2"
                      >
                        "{intent}"
                      </div>
                    ) : null,
                  )}
                </>
              )}
              {observations.length > 0 && (
                <>
                  <div className="text-[10px] text-[var(--color-ink-tertiary)] uppercase tracking-wider mb-2 mt-4">
                    Observations ({observations.length})
                  </div>
                  {observations.map((obs) => (
                    <div
                      key={obs.id}
                      className="border-l-2 border-[var(--color-accent-olive)] pl-3 mb-3"
                    >
                      <div className="text-[13px] text-[var(--color-ink-primary)] mb-1">
                        {obs.text}
                      </div>
                      <div className="text-[10px] text-[var(--color-ink-tertiary)]">
                        {Object.entries(obs.structured)
                          .filter(([k]) => k !== "raw")
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {state.guest.statedIntent.length === 0 && observations.length === 0 && (
                <div className="text-[var(--color-ink-tertiary)] text-sm italic">
                  No profile data yet.
                </div>
              )}
            </div>

            <div className="text-[11px] text-[var(--color-ink-tertiary)] mt-6 leading-relaxed">
              {CONCIERGE.name} uses this profile to personalize messages and pre-fill the
              next-stay Passport Preview. The guest can request the profile contents any time.
            </div>
          </div>
        </div>
      </div>
      <DemoNav />
    </div>
  );
}
