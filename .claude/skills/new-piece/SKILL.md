---
name: new-piece
description: Scaffold a new essay, journal entry, or poem for Cyber Pujangga with correct frontmatter and path. Use when asked to draft/add/create an essay, journal entry, or poem.
---

Run `./new-piece.sh <essay|journal|poem> <slug> [--lang en|ms] [--date ISO8601]` from the repo root, not from `cyber-pujangga-site/`.

- Default language `en`; `--lang ms` for Bahasa Melayu.
- Slug = filename, kebab-case; journal entries prefix with date, e.g. `2026-07-14-slow-day`.
- Omit `--date` unless backdating — script stamps real UTC time by default.
- Fill in `title`, `description`, and body after scaffolding — no placeholder text.
- Never hand-write frontmatter — required fields differ per section (essay/poem need `author`; journal needs `mood`; poem needs `form`).
- Check `STYLE.md` before writing the body: journal is always quiet-personal; essays about a specific work/prize/translation/debate may use the literary-critical register instead.
