# Cyber Pujangga

A bilingual (English / Bahasa Melayu) literature site. Three sections:
**Essays**, **Daily Journal**, **Poems**. Static, no tracking, no
database. Built with Astro 5 and deployed to Cloudflare Pages.

Live (after first deploy): `https://cyber_pujangga.pages.dev`

## Project layout

```
cyber-pujangga/
├── deploy.sh                  # build → wrangler deploy → cleanup old deploys
├── new-piece.sh               # scaffold new essay / journal / poem
├── cf-pages-cleanup.py        # shared with tech-journal/ (no changes)
└── cyber-pujangga-site/        # the Astro project
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
cd /home/arif_debian/projects/cyber-pujangga
./deploy.sh
```

The deploy script:
1. `npm install` (first run only)
2. `npm run build` → produces `cyber-pujangga-site/dist/`
3. `wrangler pages deploy ./dist --project-name=cyber_pujangga`
4. Deletes all previous deployments, keeping only the latest

The Cloudflare account is the same as `malay-tech-journal`
(account ID `1c5731ce0fd505c95adb0069d6aa4dd2`).

## Bilingual model

- **Per-file language**: each piece lives in `en/` or `ms/` folder; no
  translation pairing. Authors translate manually when they want both
  versions.
- **URLs**: `/en/essays/slug/` and `/ms/essays/slug/`.
- **Language toggle** in the header switches to the same page in the
  other language (falls back to landing if no equivalent).
- **Default locale**: `en` (with prefix). Root URL `/` redirects to `/en`.

## RSS

Per-language feeds at `/en/rss.xml` and `/ms/rss.xml`.
