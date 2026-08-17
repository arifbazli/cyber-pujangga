# Context

## What this is
A personal bilingual (EN/MS) literature site — essays, journal, poems — and deliberately a case study in agent-driven development: the scaffold, i18n routing, content collections, and deploy pipeline were built via natural-language prompts, with the human role kept to high-level direction.

## Why it's built this way
- **Static, zero-tracking, no database** — content is Markdown in-repo so an agent edits content the same way it edits code.
- **Per-file language over translation-pairing** — each piece lives independently under `en/`/`ms/`; no forced 1:1 link, to keep routing simple enough for an agent to reason about.
- **One deploy script** — `deploy.sh` bundles build + deploy + prune, mirroring the sibling `tech-journal` project so both stay operable the same way.
- **Biome over ESLint/Prettier** — one tool, less config surface to get wrong.

## Non-goals
No CMS, no database, no accounts/comments, no automated translation, not a generalized multi-tenant blog engine.

## Related project
`tech-journal` — shares the Cloudflare account and `cf-pages-cleanup.py`; keep that script compatible with both.
