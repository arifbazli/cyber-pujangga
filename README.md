
# Cyber Pujangga

A bilingual (English / Bahasa Melayu) literature site — **Essays**, **Daily Journal**, and **Poems** — built as a fully static Astro 5 site with zero tracking and no database, deployed to Cloudflare Pages.

**Live:** [`cyber-pujangga.pages.dev`](https://cyber-pujangga.pages.dev)

---

## About this project

Cyber Pujangga started as a place for bilingual literary writing, but it also doubles as a **case study in AI-agent-driven development**. The entire scaffold — project structure, i18n routing, content collections, layouts, and the deploy pipeline — was built through natural-language prompts to a local coding agent, with the human role kept to short, high-level direction rather than hands-on implementation.

If you're exploring this repo as a reference for agent-driven workflows, the interesting parts are:
- The **content model** (`src/content/`) — how per-language Markdown collections are structured so an agent can scaffold new pieces consistently via `new-piece.sh`.
- The **deploy pipeline** (`deploy.sh` + `cf-pages-cleanup.py`) — a single script that builds, deploys, and prunes old Cloudflare Pages deployments automatically.
- The **i18n approach** — per-file language folders instead of translation-pairing, keeping routing and content simple enough for an agent to reason about.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Astro 5 |
| Content | Markdown collections (`content.config.ts`) |
| Styling | Plain CSS (`src/styles/global.css`) |
| Hosting | Cloudflare Pages (via Wrangler) |
| Tooling | Biome (lint/format) |

## Project layout

```
cyber-pujangga/
├── deploy.sh                  # build → wrangler deploy → cleanup old deploys
├── new-piece.sh               # scaffold new essay / journal / poem
├── cf-pages-cleanup.py        # shared with tech-journal/ (no changes)
└── cyber-pujangga-site/       # the Astro project
    ├── astro.config.ts
    ├── content.config.ts
    ├── public/
    └── src/
        ├── content/
        │   ├── essays/{en,ms}/     # one MD file per essay
        │   ├── journal/{en,ms}/    # one MD file per journal entry
        │   ├── poems/{en,ms}/      # one MD file per poem
        │   └── pages/              # about.en.md, about.ms.md
        ├── i18n/
        │   ├── index.ts            # locale helpers
        │   └── lang/{en,ms}.ts     # UI strings
        ├── components/             # Header, Footer, PieceCard
        ├── layouts/                # BaseLayout, PieceLayout
        ├── lib/                    # content helpers
        ├── pages/
        │   ├── index.astro         # redirect to /en
        │   ├── 404.astro
        │   └── [lang]/
        │       ├── index.astro
        │       ├── about.astro
        │       ├── rss.xml.js
        │       ├── essays/{index,[...slug]}.astro
        │       ├── journal/{index,[...slug]}.astro
        │       └── poems/{index,[...slug]}.astro
        └── styles/global.css
```

## Local development

```bash
cd cyber-pujangga-site
npm install
npm run dev          # http://localhost:4321
```

## Adding content

```bash
# From the project root (cyber-pujangga/)
./new-piece.sh essay my-new-essay
./new-piece.sh journal 2026-07-14-some-day
./new-piece.sh poem a-quiet-poem --lang ms
```

## Deploying

```bash
export CLOUDFLARE_API_TOKEN=cfut_xxxxx   # same token as tech-journal
cd ~/projects/cyber-pujangga
./deploy.sh
```

The deploy script:
1. Runs `npm install` (first run only)
2. Builds the site (`npm run build` → `cyber-pujangga-site/dist/`)
3. Deploys via `wrangler pages deploy ./dist --project-name=cyber-pujangga`
4. Deletes all previous deployments, keeping only the latest

> Uses the same Cloudflare account as `malay-tech-journal` (account ID `1c5731ce0fd505c95adb0069d6aa4dd2`).

## Bilingual model

- **Per-file language** — each piece lives in an `en/` or `ms/` folder; no translation pairing. Authors translate manually when they want both versions.
- **URLs** — `/en/essays/slug/` and `/ms/essays/slug/`.
- **Language toggle** in the header switches to the same page in the other language (falls back to the section landing page if no equivalent exists).
- **Default locale** — `en`. Root URL `/` redirects to `/en`.

## RSS

Per-language feeds at `/en/rss.xml` and `/ms/rss.xml`.

## License

Personal project — content and code are not licensed for reuse unless stated otherwise.


