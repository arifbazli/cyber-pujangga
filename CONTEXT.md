# Context

Personal bilingual (EN/MS) literature site, and a case study in agent-driven development — scaffold, i18n, content pipeline, and deploy were all built via natural-language prompts.

## Why it's built this way
- **Static, no database** — content is Markdown in-repo, so an agent edits content the same way it edits code.
- **Per-file language** — `en/`/`ms/` are independent, no forced translation pairing; keeps routing simple enough for an agent to reason about.
- **One deploy script** — `deploy.sh` mirrors the sibling `tech-journal` project's pipeline.
- **Biome only** — one lint/format tool, less config surface to get wrong.

## Non-goals
No CMS, no database, no accounts/comments, no automated translation, not a generic multi-tenant blog engine.

## Related project
`tech-journal` — shares the Cloudflare account and `cf-pages-cleanup.py`; keep that script compatible with both.
