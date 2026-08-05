#!/usr/bin/env bash
# ============================================================================
#  new-piece.sh — scaffold a new content file for Cyber Pujangga
# ----------------------------------------------------------------------------
#  Usage:
#    ./new-piece.sh essay my-thought
#    ./new-piece.sh journal 2026-07-14-slow-day
#    ./new-piece.sh poem quiet-room
#    ./new-piece.sh essay esei-saya --lang ms
#    ./new-piece.sh essay my-thought --date "2026-08-01T08:30:00Z"
#
#  Sections:
#    essay   -> src/content/essays/{lang}/{slug}.md
#    journal -> src/content/journal/{lang}/{slug}.md
#    poem    -> src/content/poems/{lang}/{slug}.md
#
#  Flags:
#    --lang <en|ms>     Language of the piece (default: en)
#    --date <ISO8601>   Override pubDate (default: now in UTC, ISO 8601)
#                       Useful when posting a backdated piece or batching.
#                       Pass a date-only "YYYY-MM-DD" or full timestamp.
#
#  Date behaviour:
#    By default, the script stamps the current real-time moment (UTC) into
#    `pubDate` (and `date` for journal entries) as a full ISO 8601 timestamp.
#    Two pieces created in the same minute will share a key — that's fine.
#    Two pieces created on the same calendar day will *not* collide because
#    the time component makes the slug-pairing key unique.
# ============================================================================

set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/cyber-pujangga-site" && pwd)"

usage() {
  sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
}

[ $# -ge 2 ] || usage

SECTION="$1"
SLUG="$2"
LANG="en"
DATE_OVERRIDE=""

shift 2
while [ $# -gt 0 ]; do
  case "$1" in
    --lang) LANG="$2"; shift 2 ;;
    --date) DATE_OVERRIDE="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

case "$LANG" in
  en|ms) ;;
  *) echo "✗ --lang must be 'en' or 'ms'"; exit 1 ;;
esac

case "$SECTION" in
  essay)   BASE="$SITE_DIR/src/content/essays/$LANG";   KIND="essay" ;;
  journal) BASE="$SITE_DIR/src/content/journal/$LANG"; KIND="journal" ;;
  poem)    BASE="$SITE_DIR/src/content/poems/$LANG";    KIND="poem" ;;
  *) echo "✗ section must be: essay | journal | poem"; exit 1 ;;
esac

mkdir -p "$BASE"
FILE="$BASE/$SLUG.md"

if [ -f "$FILE" ]; then
  echo "✗ Already exists: $FILE"
  exit 1
fi

# Real-time stamp in UTC, full ISO 8601 (date + time + Z).
# Example: 2026-07-27T13:42:08Z
# This makes the slug-pairing key unique even when many pieces share
# the same calendar day.
if [ -n "$DATE_OVERRIDE" ]; then
  NOW="$DATE_OVERRIDE"
else
  NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
fi

# Print the timestamp up front so the user can confirm what got stamped.
echo ""
echo "  ↳ pubDate: $NOW (real-time UTC stamp)"

case "$KIND" in
  essay)
    cat > "$FILE" <<EOF
---
title: "$SLUG"
description: ""
pubDate: $NOW
author: "Cyber Pujangga"
tags: []
---

Write your essay here.
EOF
    ;;
  journal)
    cat > "$FILE" <<EOF
---
title: "$SLUG"
description: ""
date: $NOW
pubDate: $NOW
mood: ""
tags: []
---

Write your journal entry here.
EOF
    ;;
  poem)
    cat > "$FILE" <<EOF
---
title: "$SLUG"
description: ""
pubDate: $NOW
author: "Cyber Pujangga"
form: "free-verse"
dedication: ""
tags: []
---

First line of the poem.
Second line of the poem.
EOF
    ;;
esac

echo "✓ Created: $FILE"
echo ""