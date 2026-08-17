# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Cursor, etc.) working in this repo.

## What this repo is
Cyber Pujangga is a bilingual (EN/MS) literature site — essays, journal, poems — built as a static Astro 5 site, deployed to Cloudflare Pages. See CONTEXT.md for background, PLAN.md for what's in flight, STYLE.md for the writing voice(s) to use when drafting content.

## Layout
- `cyber-pujangga-site/` — the Astro app (all source code)
- `new-piece.sh`, `deploy.sh`, `cf-pages-cleanup.py` — repo-root scripts, run from `cyber-pujangga/`, not from inside the Astro app
- `.github/workflows/scheduled-code-check.yml` — weekly type/lint/build check, auto-PRs safe Biome fixes, opens an issue for the rest
- `.github/workflows/deploy-on-ui-change.yml` — auto-deploys to production (`cyber-pujangga.pages.dev`) on every push to `master` that touches `src/components/`, `src/layouts/`, `src/styles/`, `public/`, `astro.config.ts`, or `src/site.config.ts`. **Merging a UI-touching PR now deploys automatically** — no manual `./deploy.sh` step needed for those paths. Content-only changes (`src/content/**`) still require a manual deploy.

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
- Don't run `./deploy.sh` manually unless explicitly asked — it deploys to production and deletes prior Cloudflare Pages deployments. (UI-path PRs deploy automatically on merge, see Layout above — don't also deploy manually for those.)
- Don't edit `cf-pages-cleanup.py` without checking the `tech-journal` sibling project's copy — it's meant to stay in sync.
