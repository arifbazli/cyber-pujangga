# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Cursor, etc.) working in this repo.

## What this repo is
Cyber Pujangga is a bilingual (EN/MS) literature site — essays, journal, poems — built as a static Astro 5 site, deployed to Cloudflare Pages. See CONTEXT.md for background, PLAN.md for what's in flight.

## Layout
- `cyber-pujangga-site/` — the Astro app (all source code)
- `new-piece.sh`, `deploy.sh`, `cf-pages-cleanup.py` — repo-root scripts, run from `cyber-pujangga/`, not from inside the Astro app
- `.github/workflows/scheduled-code-check.yml` — weekly type/lint/build check, auto-PRs safe Biome fixes, opens an issue for the rest

## Setup
    cd cyber-pujangga-site && npm install
Requires Node >= 22.12.0.

## Common commands
From `cyber-pujangga-site/`:
| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at localhost:4321 |
| `npm run build` | Redirect gen + `astro build` |
| `npm run check` | `astro check` (types) |
| `npm run format` | `biome format --write .` |
| `npx biome check .` | Lint (non-destructive) |

From repo root:
| Command | Purpose |
|---|---|
| `./new-piece.sh <essay\|journal\|poem> <slug> [--lang en\|ms] [--date ISO8601]` | Scaffold content |
| `./deploy.sh [--no-clean]` | Build → wrangler deploy → prune old deploys |

## Conventions
- Content: `src/content/{essays,journal,poems}/{en,ms}/*.md` — one file per language, no translation pairing. Don't invent a linking mechanism.
- Lint/format is Biome — don't add ESLint/Prettier.
- Before calling work done: `npm run check`, `npx biome check .`, `npm run build` must all pass.

## Don't
- Don't commit `CLOUDFLARE_API_TOKEN` or any secret.
- Don't run `./deploy.sh` unless explicitly asked — it deploys to production and deletes prior Cloudflare Pages deployments.
- Don't edit `cf-pages-cleanup.py` without checking the `tech-journal` sibling project's copy — it's meant to stay in sync.
