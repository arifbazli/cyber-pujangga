# CLAUDE.md

@AGENTS.md

## Claude Code specifics
Skills for this repo live in `.claude/skills/` — prefer them over re-deriving the same steps ad hoc:
- `new-piece` — scaffold an essay/journal/poem
- `deploy-site` — build, deploy, and prune Cloudflare Pages deployments
- `bilingual-check` — audit EN/MS content pairs for drift

Treat CONTEXT.md and PLAN.md as living docs: update PLAN.md when a tracked initiative starts/completes; update CONTEXT.md only when an architectural decision actually changes.
