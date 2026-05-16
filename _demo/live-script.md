# Live Demo Script — Round 1 (3 minutes)

**Setup:** laptop on `/preview`. Side-pill nav visible. Arrow keys ready. Speak slowly.

---

## 0:00 — Opener (locked, verbatim)

> "I asked the front desk how they communicate with guests. They send the same text to every guest. They hand every guest the same map — with a Bali timeshare ad, a real estate agent, and a historic estate. **Today, we give every guest their own concierge.**"

*Hold a beat after "concierge." Don't rush the click.*

---

## 0:20 — Step 1: `/preview` (Intake with James)

**Click:** answer the three prompts. Real answers (*"first time, with my husband, want to slow down, love wine"*).

**Say:**
> "Three questions. James drafts a five-item itinerary from Sand Hill's real catalog — Madera, Asaya, the Ridge Rosé Reveal."

*Name two real experiences. That's the proof it isn't generic.*

---

## 0:45 — Step 2: `/passport` (Redemption)

**Click:** `→`. Tap **Redeem** on Madera. Snap a photo.

**Say:**
> "Photo is the redemption. Stamp lands, and the unlock surfaces — *sommelier walkthrough after the third course, chef's amuse to take home.*"

*Let the unlock render before talking over it.*

---

## 1:10 — Step 3: `/staff` (Observation → profile)

**Click:** `→`. Type: *"Marcie mentioned her sister's wedding in Sonoma next May."*

**Say:**
> "Any staff member. They type what they hear. The agent structures it into the profile — live."

*Point at the field that updates. This is the Sonoma seed you harvest at 2:40.*

---

## 1:30 — Step 4: `/passport/concierge` (Tool-use)

**Click:** `→`. Type: *"move my cycling later."*

**Say:**
> "James isn't reading a script. He's calling `update_passport` — mutating state from natural language. Same architecture as MCP, no wire protocol."

*The Anthropic moment. Say "tool-use" out loud. Wait for the confirmation bubble.*

---

## 1:55 — Step 5: `/passport/departure` (Forward seed)

**Click:** `→`.

**Say:**
> "Stamps tally — earned, and banked. Banked means the hotel owes the guest the missed unlock next stay. And one forward-seed card with a specific date."

*Point at the date. Specificity is the point.*

---

## 2:15 — Step 6: `/timeline` (Cadence — closing line lands here)

**Click:** `→`. Day-14 and Day-90 previews on James's calendar.

**Say (locked, verbatim):**
> "We send three messages a year to high-engagement guests. To guests who stretched to be here, we send one — their anniversary photo. Most days, for most guests, we do nothing."

*Slow it down. The Day-14 references the photo Marcie uploaded at 0:45 — point at it.*

---

## 2:40 — Step 7: `/preview/welcome-back` (Loop close)

**Click:** `→`. The banner is the payoff.

**Say:**
> "Day-90 message lands. She clicks. She's back on her Passport Preview, pre-filled. *What you loved. What we saved for you. New since you left.* And the banner — *James mentioned your sister's wedding in Sonoma.* That observation was typed 90 seconds ago in this demo."

*Don't talk after. Let them see it.*

---

## 2:58 — Close

Step back. No more words. The Sonoma banner finishes the pitch.

---

# Q&A Prep

**Q: How is this different from Salesforce Hospitality Cloud or Revinate?**
Those store transactions between stays. The Passport captures stated intent and declined options *before* the credit card, then recombines them into three messages a year. Most CRMs send more. We send less, better.

**Q: Is the agent doing real tool-use or scripted?**
Real tool-use. Four typed TypeScript functions — `get_property_info`, `query_availability`, `update_passport`, `redeem_experience`. Claude Opus 4.7 decides which to call. The "move my cycling later" path is one of many.

**Q: What about privacy on the photos?**
Encrypted to the guest's account password — server holds ciphertext only. Never used as ad creative. The Day-60 memory card returns her own photo to her. We hold the memory; we don't analyze the picture.

**Q: How do you sell this into Rosewood or Aman?**
Director of Guest Experience and Director of CRM. The front desk at Sand Hill confirmed this morning they send the same text to every guest. Buyer validated the problem before we wrote a line of code. Sales is following up with a tour.

**Q: What's the cadence engine actually doing?**
Daily evaluation per guest. Emits `send_message`, `schedule_later`, or `silent`. Tier (high / mid / stretch) is a hard constraint on frequency. A stretch-stay guest gets one message a year — the anniversary photo. No pitch. That's the trust move.
