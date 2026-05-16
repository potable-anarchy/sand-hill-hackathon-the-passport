"use client";

import { useCallback, useEffect, useState } from "react";
import type { PassportItem, PassportState } from "@/lib/types";
import { experienceById } from "@/lib/property-catalog";
import { PassportCard } from "./PassportCard";
import { PhotoUploadSheet } from "./PhotoUploadSheet";
import { StampConfirmation } from "./StampConfirmation";

type Props = {
  initialState: PassportState;
};

type ConfirmInfo = {
  experienceName?: string;
  slot?: string;
  unlock?: string;
  stampsEarned?: number;
};

export function PassportItineraryView({ initialState }: Props) {
  const [state, setState] = useState<PassportState>(initialState);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [photoItem, setPhotoItem] = useState<PassportItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInfo, setConfirmInfo] = useState<ConfirmInfo | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as PassportState;
    setState(data);
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  async function redeem(item: PassportItem, photoUrl?: string) {
    setBusyItemId(item.id);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          outcome: "stamped",
          ...(photoUrl ? { photoUrl } : {}),
        }),
      });
      const result = (await res.json()) as {
        ok: boolean;
        unlock?: string;
        stampsEarned?: number;
      };
      const exp = experienceById(item.experienceId);
      setConfirmInfo({
        experienceName: exp?.name,
        slot: item.slot,
        unlock: result.unlock ?? exp?.unlock,
        stampsEarned: result.stampsEarned,
      });
      setConfirmOpen(true);
      await refresh();
    } finally {
      setBusyItemId(null);
    }
  }

  function handleRedeemClick(item: PassportItem) {
    const exp = experienceById(item.experienceId);
    if (exp?.photoRedemptionAppropriate) {
      setPhotoItem(item);
    } else {
      redeem(item);
    }
  }

  async function handlePhotoSubmit({
    itemId,
    photoUrl,
  }: {
    itemId: string;
    photoUrl: string;
  }) {
    const target = state.items.find((i) => i.id === itemId);
    if (!target) return;
    await redeem(target, photoUrl);
    setPhotoItem(null);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ background: "var(--bg-cream, #FAF7F2)" }}
      >
        <h1
          className="text-[32px] leading-tight"
          style={{
            fontFamily:
              "var(--font-serif, 'Cormorant Garamond', Georgia, serif)",
            color: "var(--ink-primary, #1F1E1A)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          Your Passport
        </h1>
        <p
          className="mb-6 text-[13px]"
          style={{ color: "var(--ink-secondary, #5C5953)" }}
        >
          Fri — Sun · Sand Hill
        </p>

        {state.items.length === 0 && (
          <div
            className="rounded-[12px] border p-8 text-center text-[13px]"
            style={{
              background: "var(--surface-white, #FFFFFF)",
              borderColor: "var(--divider, #E8E4DC)",
              color: "var(--ink-secondary, #5C5953)",
            }}
          >
            No experiences yet. James will hold a few once your stay begins.
          </div>
        )}

        {state.items.map((item) => (
          <PassportCard
            key={item.id}
            item={item}
            onRedeem={handleRedeemClick}
            busy={busyItemId === item.id}
          />
        ))}
      </div>

      <PhotoUploadSheet
        open={!!photoItem}
        targetItem={photoItem}
        onClose={() => setPhotoItem(null)}
        onSubmit={handlePhotoSubmit}
      />

      <StampConfirmation
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        experienceName={confirmInfo?.experienceName}
        slot={confirmInfo?.slot}
        unlock={confirmInfo?.unlock}
        stampsEarned={confirmInfo?.stampsEarned}
      />
    </div>
  );
}
