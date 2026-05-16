# Live Demo Script — Round 1 (3 minutes)

**Pre-flight (do this once before the demo starts):**

1. `pnpm dev` running on port 3100. Confirm `/api/tts` returns `{"available": true}` and that `MOCK_MODE=false` in `.env.local`.
2. Visit `http://localhost:3100/api/state` and DELETE it (or restart server) so state is clean.
3. Open `http://localhost:3100/preview` in Chrome at 110% zoom. Side-pill nav visible.
4. Speakers on. Audio levels tested.
5. Keyboard: `→` advances to next demo page (only fires when not in a text input).

**Realistic timing:** Claude itinerary takes ~7 seconds, concierge chat ~4 seconds. Don't fight the loading state — narrate over it.

**Opener and closing line are LOCKED. Everything else is a guide, not a script.**

---

## 0:00 — Opener (locked, verbatim)

Look at the audience, not the screen.

> "I asked the front desk this morning how they communicate with guests. They send the same text to every guest, every day. They hand every guest the same map — with a Bali timeshare ad, a real estate agent, and a historic estate. **Today, we give every guest their own concierge.**"

*Hold a one-beat pause after "concierge." Don't rush.*

---

## 0:15 — Step 1 · `/preview` (intake with James)

Click into the chat. James opens with a question (already on screen). Type three short answers — these are the exact strings to type so they parse the way Claude expects:

| Step | Type into chat |
|---|---|
| Answer 1 | *"slow morning, cypress grove, unhurried dinner"* |
| Answer 2 | *"Saturday dinner for two, near sunset"* |
| Answer 3 | *"no early mornings, no crowds"* |

**Narrate as you type the third:**

> "Three questions. James — our concierge — drafts the stay from the real Sand Hill experience catalog."

After Answer 3, James says **"One moment — drafting your stay."** Claude takes about 7 seconds. **Don't fight the wait — narrate:**

> "He's an actual agent. Claude with tool-use, calling our property catalog, picking what fits her tone."

Itinerary card appears. Read the experience names out loud — Madera, Asaya, Clubhouse Perfumer. **Naming real Rosewood experiences is the proof it isn't generic.**

---

## 0:55 — Step 2 · `/passport` (redemption)

Press `→` to navigate. Click **Capture your experience** on the Madera card.

Camera or file-picker opens. **For demo:** have a sunset photo ready in Downloads. Pick it. Sheet shows:

> *"Save to your Passport — unlocks sommelier walkthrough after the third course + chef's amuse to take home."*

Tap **Save to Passport.** Stamp confirmation modal pops:

**Say while it animates:**

> "Photo is the redemption mechanic. The stamp lands, the unlock surfaces — a real sommelier visit, a take-home amuse. Specific. Named."

---

## 1:25 — Step 3 · `/staff` (observation → profile)

Press `→` to navigate. Type into the observation field **verbatim**:

> *Marcie mentioned her sister's wedding in Sonoma next May.*

Press send.

**Say:**

> "Any staff member, anywhere on property. They type what they hear. Claude structures it into the guest's profile — live."

The Profile side-panel updates within ~2s with the structured fields: `family_event`, `family_member`, `location_mentioned`, `date_mentioned`. **Point at the panel as it updates.**

> "This is the seed we'll harvest in ninety seconds."

---

## 1:55 — Step 4 · `/passport/concierge` (tool-use)

Press `→`. The James thread is empty. Type:

> *swap my Madera tasting for the bar instead*

Press send. ~4 seconds. Watch the chat. James replies:

> *"Swapped — you're at the Madera bar at 6:30 instead."*

**Say while you wait, then over the reply:**

> "James isn't reading from a script. He's calling `update_passport` — mutating real state from natural language. Same architecture as MCP, no wire protocol."

**Tap the play icon** next to James's bubble. George's voice reads the reply.

> "And every reply has a voice. ElevenLabs. Brand-consistent across every Rosewood property."

*If voice doesn't fire instantly, keep moving — the demo carries.*

---

## 2:20 — Step 5 · `/passport/departure` (forward seed)

Press `→`. The page shows: *Until next time* · stamps tally (1 earned, banked count) · forward-seed card · *See the year ahead →*.

**Point at the forward-seed card.**

> "Stamps earned. Stamps banked — that's the hotel owing the guest the unlock she missed, next stay. And one forward-seed card with a specific date. We don't say 'we'll be in touch.' We say August 1, Ridge Rosé Reveal."

---

## 2:35 — Step 6 · `/timeline` (cadence + closing line)

Press `→`. Two email drafts on screen — Day 14 and Day 90.

**Closing line is LOCKED.** Slow down.

> "We send three messages a year to high-engagement guests. To guests who stretched to be here, we send one — their anniversary photo. **Most days, for most guests, we do nothing.**"

Point at the Day-14 email — it references the actual photo and the actual restaurant from the stay. **That specificity is the punchline of this slide.**

---

## 2:55 — Step 7 · `/preview/welcome-back` (loop close)

Press `→`. The page renders:

- Welcome-back banner: *"James remembered what you mentioned about Sonoma — we held a thought for it."*
- *What you loved last time* (Marcie's photo from Madera + experience names)
- *We saved this for you* (if any banked)
- *New since you left* (Clubhouse Perfumer)
- *Pick up where you left off →*

**Don't talk over it.** Let it land for 3 seconds. Then:

> "Day 90 lands. She clicks. She's back on her Passport — pre-filled with everything we learned last time. The banner references the wedding observation typed ninety seconds ago in this demo. The loop closes."

---

## 3:10 — Step back

Quiet. No more words. Hands off the keyboard.

---

# Recovery moves (if Claude/voice stalls)

| Failure | Move |
|---|---|
| Itinerary takes >10s | "He's checking what's actually held at each spot — not a template." Then wait. |
| Concierge takes >8s | "Same thing — real tool-use means a real round-trip." Wait. |
| Voice icon doesn't play | Skip it. Say "voice is on every message, brand-consistent George across every property." Move to the next page. |
| State mutation fails (rare) | Type the command again. If it fails twice: "we'll come back to that one." Skip to next page. |
| Welcome-back banner doesn't reference Sonoma | "She might also hear from us about the wedding — that observation gets used across her next year of messages." Don't dwell. |

---

# Q&A Prep

**Q: How is this different from Salesforce Hospitality Cloud or Revinate?**
Those store transactions between stays. The Passport captures stated intent and declined options *before* the credit card, then recombines them into three messages a year. Most CRMs send more. We send less, better.

**Q: Is the agent doing real tool-use or scripted?**
Real tool-use. Four typed TypeScript functions — `get_property_info`, `query_availability`, `update_passport`, `redeem_experience`. Claude Opus 4.7 decides which to call. We pass the guest's current passport into the system prompt so Claude can map "my Madera tasting" to an itemId on its own — no clarifying questions back to the guest.

**Q: What if Claude makes a mistake?**
Every mutation goes through a typed tool with a constrained schema. The worst case is "did nothing" — Claude can't write arbitrary state. And in the demo, real Claude has refused to move things to slots that conflict with other bookings unprompted.

**Q: What about privacy on the photos?**
Encrypted to the guest's account password — server holds ciphertext only. The Day-60 memory card returns her own photo to her. We hold the memory; we don't analyze the picture.

**Q: How do you sell this into Rosewood or Aman?**
Director of Guest Experience and Director of CRM. The front desk at Sand Hill confirmed this morning they send the same text to every guest. Buyer validated the problem before we wrote a line of code. Sales is following up with a tour.

**Q: What's the cadence engine actually doing?**
Daily evaluation per guest. Emits `send_message`, `schedule_later`, or `silent`. Tier (high / mid / stretch) is a hard constraint on frequency. A stretch-stay guest gets one message a year — the anniversary photo. No pitch. That's the trust move.

**Q: Could Mati from ElevenLabs hear George talk?**
Tap any play icon next to James in the chat. He responds in George's voice every time. (And George is editorial-British — sounds like a real concierge.)
