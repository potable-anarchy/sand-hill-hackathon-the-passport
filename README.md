# The Passport

[![The Passport — 60-second demo](https://img.youtube.com/vi/EUjgsawZ2Oo/maxresdefault.jpg)](https://youtu.be/EUjgsawZ2Oo)

▶ **[Watch the 60-second demo](https://youtu.be/EUjgsawZ2Oo)**

---

A luxury hospitality CRM where the central artifact is a passport — an itinerary that begins **before** booking, accumulates stamps across activities, holds a conversation with a single AI concierge, and recombines into the right post-stay outreach.

Built today at the **Hospitality 2030 hackathon at Rosewood Sand Hill** (May 16, 2026).

## The pitch

I asked the front desk at Sand Hill how they currently communicate with guests. They send the same text to every guest, every day. They hand every guest the same map — with a Bali timeshare ad, a real estate agent, and a historic estate. Three different teams, all guessing at the same broadcast.

**The Passport gives every guest their own concierge.**

A guest's passport is five signals deep:

| Signal | Captured at | Used for |
|---|---|---|
| Stated intent | Pre-booking chat with James | Generating the passport, tone of all outreach |
| Chosen action | Stamps earned at experiences | Day-14 warm closure |
| Declined option | Alternates held at booking | Day-90 re-pitch (forward-framed, never "you skipped") |
| Felt moment | Photo uploaded at an activity | Day-60 memory card |
| Kept promise | Stamps earned + banked | Forward seed at departure; carried into the next passport |

The product is the **loop**. A Day-90 message lands → guest clicks → returns to a Passport Preview pre-filled with everything we learned last time, including staff observations captured during the stay.

## Walking the demo (~3 minutes)

The dev server provides side-pill navigation + `← / →` arrow keys to step through. Demo order:

1. **`/preview`** — Intake chat with James. Three lightweight questions; James drafts a 5-item itinerary using the real Sand Hill experience catalog (Madera, Asaya, Bici, Cycling Concierge, Ridge Rosé Reveal, Clubhouse Series with perfumer Kori Shaw).
2. **`/passport`** — Active stay. Each held experience has a Redeem button; photo-eligible items open the camera + earn an inline unlock (e.g. *Sommelier walkthrough after the third course + chef's amuse to take home*).
3. **`/staff`** — Staff side. Type an observation like *"Marcie mentioned her sister's wedding in Sonoma next May"* — AI structures it into the guest profile in real time.
4. **`/passport/concierge`** — Chat with James during the stay. Type *"move my cycling later"* — the agent calls a tool, mutates the passport, James confirms with the new slot.
5. **`/passport/departure`** — Checkout. Stamps tally (earned + banked, where "banked" means the hotel owes the guest the missed unlock next stay) + a forward-seed card with a specific future date.
6. **`/timeline`** — Two AI-drafted email previews on James's outbound calendar: a Day-14 warm closure (references the actual photo if one was uploaded) and a Day-90 re-pitch for something banked.
7. **`/preview/welcome-back`** — Loop close. Three sections: *What you loved* (with photos), *We saved this for you* (banked), *New since you left* — plus a welcome-back banner that references the Sonoma observation captured in step 3.

The loop closes visibly on screen: data flows guest → staff → agent → guest again, end-to-end, in 60 seconds.

## Tech

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 App Router · React 19 · TypeScript | |
| Styling | Tailwind 4 · Cormorant Garamond + Inter | All design tokens inline as CSS vars (cream, sage olive, brass, clay) |
| Agent | Anthropic Claude (Opus 4.7 + Haiku 4.5) via `@anthropic-ai/sdk` | Real tool-use loop in `src/lib/agent.ts`. Four typed tool functions in `src/lib/tools.ts`: `get_property_info`, `query_availability`, `update_passport`, `redeem_experience`. Same architecture as MCP, without the wire protocol. |
| Voice | ElevenLabs TTS via `@elevenlabs/elevenlabs-js` | Tap-to-hear icon on each James chat bubble (in MOCK_MODE the icon renders but doesn't play). |
| State | In-memory server singleton | One guest profile + items + photos + messages + observations. Single-machine demo state; no DB needed. |
| Property data | Real Rosewood Sand Hill catalog | Sourced from [rosewoodhotels.com/en/sand-hill-menlo-park/experiences](https://www.rosewoodhotels.com/en/sand-hill-menlo-park/experiences). |

The agent runs in **MOCK_MODE by default** so the demo works without API keys. Drop `ANTHROPIC_API_KEY` + `ELEVENLABS_API_KEY` in `.env.local` and set `MOCK_MODE=false` to route through real Claude and real TTS.

## Run locally

```bash
pnpm install
pnpm dev
# → http://localhost:3000/preview
```

The root path redirects to `/preview`. Cycle through the demo with the side-pill nav or your arrow keys.

## Hackathon details

- **Event:** Hospitality 2030 — A Rosewood Sand Hill Hackathon
- **Date:** May 16, 2026
- **Headline problem statement:** PS3 — Post-Stay Relationship Continuity / Hyper-Personalized Guest Memory Engine
- **Load-bearing support:** PS1 (pre-arrival passport refinement), PS2 (concierge anticipation grounded in stated intent)

## What's mocked vs real

| Real | Mocked |
|---|---|
| Every Sand Hill experience name (Madera, Asaya, Bici, Cycling Concierge, Ridge Rosé Reveal, Clubhouse Series with perfumer Kori Shaw) | Time slots — Rosewood doesn't publish slot-level availability publicly |
| The front-desk validation that drives the pitch | The "guest" — a single demo profile named Marcie |
| Agent architecture (tool-use, intent parsing, state mutation) | Mock concierge replies when no Anthropic key present |
| Photo upload + redemption flow | The chef "Reni" name — placeholder until verified with Madera |
| Staff observation → AI structuring → guest profile callback | Email send-cadence (rendered as previews; no actual SMTP) |
| Loop-close: Day-90 click pre-fills Preview with prior signals | The encrypted-photo architecture (described in PRD; demo uses simple data URLs) |

## License

Built for the Hospitality 2030 hackathon. Repository public per hackathon rules.
