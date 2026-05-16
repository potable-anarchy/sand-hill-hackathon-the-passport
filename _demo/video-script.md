# 60-Second Submission Video Script

**Recording approach:** screen recording (QuickTime · Cmd+Shift+5) + voiceover laid over in iMovie / Descript / QuickTime.

**Before recording:** run `./_demo/seed-state.sh` (below) once to pre-populate the demo state — itinerary + photo + observation. Start recording at `/passport`, **not** `/preview`, so you skip the 15s of intake typing + Claude generation.

Twelve 5-second beats. Calm, specific voiceover. George's voice should fire **once** during the recording (tap it at beat 6 so it's audible in the video).

---

**0:00–0:05 — Front-desk validation**
Screen: photo of the Rosewood Sand Hill front-desk map fading in with the ads visible (Bali timeshare, real estate, Filoli historic estate). If no photo, use a slow zoom on `/preview` initial state.
VO: *"I asked the front desk at Sand Hill how they talk to guests. They send the same text to every guest, every day. The same map. Today, we give every guest their own concierge."*

**0:05–0:10 — Passport (`/passport`)**
Screen: Passport Itinerary tab. Four held experiences visible: pool, spa, Clubhouse Perfumer, Madera tasting. Stamps balance reads "0 ⌘".
VO: *"James — a Claude agent — drafts her stay from the real Sand Hill catalog. Asaya. The Perfumer's Practice. Madera."*

**0:10–0:20 — Photo redemption**
Screen: tap **Capture your experience** on Madera. Picker opens. Pick a sunset photo. Sheet shows: *"Save to your Passport — unlocks sommelier walkthrough after the third course."* Tap **Save to Passport**. Stamp confirmation modal pops (+ stamps tick to 1).
VO: *"The photo is the redemption mechanic. The stamp lands. The unlock surfaces — a real sommelier walkthrough, a take-home amuse from the chef."*

**0:20–0:25 — Staff observation (`/staff`)**
Screen: staff view. Type into observation field: *"Marcie mentioned her sister's wedding in Sonoma next May."* Press send. Profile panel updates within ~2s — structured fields appear: `family_event: sister's wedding`, `location_mentioned: Sonoma`.
VO: *"Any staff member types what they hear. Claude structures it into the guest's profile in real time."*

**0:25–0:35 — Concierge with voice (`/passport/concierge`)**
Screen: chat with James. Type: *"swap my Madera tasting for the bar instead."* Wait ~4s. James replies: *"Swapped — you're at the Madera bar at 6:30 instead."* The itinerary actually mutates (toggle back to `/passport` briefly OR show staff feed updating).
**Tap the ▶︎ on James's bubble — George's voice reads the reply.**
VO: *"She types in plain English. The agent calls a real tool, mutates the passport, and answers in his own voice."*

**0:35–0:40 — Checkout (`/passport/departure`)**
Screen: stamps tally + forward-seed card (*Aug 1 — Ridge Rosé Reveal — your seat is held*).
VO: *"At checkout, stamps earned, stamps banked. And one forward-seed card with a specific date — not 'we'll be in touch.'"*

**0:40–0:50 — Cadence (`/timeline`)**
Screen: scroll through the two email drafts. Day-14 references the actual sunset photo and Reni at Madera. Day-90 re-pitches the Ridge Rosé Reveal.
VO: *"Three messages a year to high-engagement guests. To guests who stretched to be here, we send one — their anniversary photo. Most days, we do nothing."*

**0:50–0:55 — Loop close click**
Screen: click the Day-90 *Plan a stay →* card. Transition to `/preview/welcome-back`.
VO: *"She clicks. She's back on her Passport, pre-filled."*

**0:55–1:00 — Loop close payoff**
Screen: welcome-back banner — *"James remembered what you mentioned about Sonoma — we held a thought for it."* Three sections below visible briefly.
VO: *"The Sonoma observation, captured 35 seconds ago in this video, becomes the personalization."*

---

# `seed-state.sh` (pre-recording setup)

Save this at `/Users/brad/code/sand-hill-hackathon-2026/the-passport/_demo/seed-state.sh`:

```bash
#!/usr/bin/env bash
# Pre-load demo state so the video can start at /passport, not /preview.
# Run once before opening QuickTime.

set -e
BASE="${BASE_URL:-http://localhost:3100}"

echo "Resetting state…"
curl -s -X DELETE "$BASE/api/state" > /dev/null

echo "Generating itinerary as Marcie…"
curl -s -X POST "$BASE/api/itinerary/generate" \
  -H "content-type: application/json" \
  -d '{"prompts":["slow morning, cypress grove, unhurried dinner","Saturday dinner for two, near sunset","no early mornings, no crowds"],"guestName":"Marcie"}' \
  | jq -r '.items[] | "  \(.experienceId) @ \(.slot)"'

echo "Adding staff observation…"
curl -s -X POST "$BASE/api/observation" \
  -H "content-type: application/json" \
  -d '{"text":"Marcie mentioned her sister'\''s wedding in Sonoma next May.","staffMember":"Front Desk"}' \
  > /dev/null

echo "✓ State ready. Open http://localhost:3100/passport"
```

Make executable: `chmod +x _demo/seed-state.sh`.

---

# Recording workflow

1. `./_demo/seed-state.sh`
2. Open `http://localhost:3100/passport` in Chrome
3. `Cmd+Shift+5` → Record Selected Portion → frame the phone-frame mock (or full window)
4. Walk through the 12 beats following the script. **Do the actions only — no voiceover yet.** Roughly 50–60s of clicks.
5. Stop recording (`Cmd+Ctrl+Esc`).
6. Open in iMovie / QuickTime / Descript.
7. Trim any waits longer than 1s (Claude calls, photo upload).
8. Record voiceover on top — read the VO lines above. Aim ~150 words / 60 seconds.
9. Export H.264 MP4, 1080p, < 100MB.

---

# Fallback if no time to edit

Record the demo continuously with the script timing — narrate live while you click. It won't be polished but it'll be 60s. Use **QuickTime → New Screen Recording → Options → Internal Microphone** to capture voiceover in the same take.
