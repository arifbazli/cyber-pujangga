# AGENTS.md

Instructions for any coding agent (Claude Code, Codex, Cursor, etc.) working in this repo.

## What this is
Cyber Pujangga: bilingual (EN/MS) essay/journal/poem site, Astro 5, static, on Cloudflare Pages. Background: `CONTEXT.md`. Active work: `PLAN.md`. Writing voice: `STYLE.md`.

## Layout
- `cyber-pujangga-site/` — the Astro app (all source code)
- `new-piece.sh`, `deploy.sh`, `cf-pages-cleanup.py` — root scripts, run from repo root, not from inside the Astro app
- `.github/workflows/scheduled-code-check.yml` — weekly type/lint/build check, auto-PRs safe Biome fixes
- `.github/workflows/deploy-on-ui-change.yml` — auto-deploys to production on merge to `master` when `src/components/`, `src/layouts/`, `src/styles/`, `public/`, `astro.config.ts`, or `src/site.config.ts` change
- `.claude/workflows/weekly-content-crew.js` — agent crew: research → draft (EN+MS) → verify → open PR (never auto-merges)

## Setup
```
cd cyber-pujangga-site && npm install
```
Requires Node >= 22.12.0.

## Commands
| Where | Command | Purpose |
|---|---|---|
| site | `npm run dev` | dev server, localhost:4321 |
| site | `npm run check` | type check |
| site | `npm run build` | build |
| site | `npx biome check .` | lint (non-destructive) |
| root | `./new-piece.sh <essay\|journal\|poem> <slug> [--lang en\|ms]` | scaffold content |
| root | `./deploy.sh` | build + deploy + prune (manual — see Don't) |

## Conventions
- Content: `src/content/{essays,journal,poems}/{en,ms}/*.md` — one file per language, no translation pairing.
- Lint/format is Biome — don't add ESLint/Prettier.
- Before calling work done: `npm run check`, `npx biome check .`, `npm run build` must all pass.

## Don't
- Don't commit `CLOUDFLARE_API_TOKEN` or any secret.
- Don't run `./deploy.sh` manually unless asked — UI-path merges already auto-deploy; content-only merges don't.
- Don't edit `cf-pages-cleanup.py` without checking the `tech-journal` sibling project's copy — it's meant to stay in sync.
