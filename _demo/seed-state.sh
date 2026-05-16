#!/usr/bin/env bash
# Pre-load demo state so the video / live demo can start at /passport,
# not at /preview. Run once before recording or before the live judging.
#
# Usage:  ./_demo/seed-state.sh
# Override the base URL with: BASE_URL=http://localhost:3000 ./_demo/seed-state.sh

set -e
BASE="${BASE_URL:-http://localhost:3100}"

say() { printf '\033[1;36m%s\033[0m\n' "$*"; }

say "Resetting state…"
curl -s -X DELETE "$BASE/api/state" > /dev/null

say "Generating itinerary as Marcie via Claude…"
curl -s -X POST "$BASE/api/itinerary/generate" \
  -H "content-type: application/json" \
  -d '{"prompts":["slow morning, cypress grove, unhurried dinner","Saturday dinner for two, near sunset","no early mornings, no crowds"],"guestName":"Marcie"}' \
  > /tmp/passport-seed-itinerary.json

if command -v jq >/dev/null 2>&1; then
  jq -r '.items[] | "  • \(.experienceId) @ \(.slot)"' /tmp/passport-seed-itinerary.json
else
  cat /tmp/passport-seed-itinerary.json
fi

say "Adding staff observation (Sonoma wedding seed)…"
curl -s -X POST "$BASE/api/observation" \
  -H "content-type: application/json" \
  -d '{"text":"Marcie mentioned her sister'\''s wedding in Sonoma next May.","staffMember":"Front Desk"}' \
  > /dev/null

say ""
say "✓ State ready."
say "  The photo is NOT pre-attached — tap 'Capture your experience' on the"
say "  first item to mock the upload. The Marcie photo will pre-load as the"
say "  preview; tap 'Save to Passport' to attach it."
say "  Live demo:    open $BASE/preview  (← will re-do intake — only for full live demo)"
say "  Video record: open $BASE/passport (starts at the itinerary, skip intake)"
