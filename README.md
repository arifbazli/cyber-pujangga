# Cyber Pujangga

[![Live](https://img.shields.io/badge/live-cyber--pujangga.pages.dev-75935c)](https://cyber-pujangga.pages.dev)
[![Astro](https://img.shields.io/badge/Astro-7.0-ff5d01)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020)](https://pages.cloudflare.com)
[![Biome](https://img.shields.io/badge/lint-Biome-60a5fa)](https://biomejs.org)

A bilingual (English / Bahasa Melayu) home for essays, journal notes, and poems.  
Cyber Pujangga is a static Astro 7 site on Cloudflare Pages, built to keep content as ordinary
Markdown while letting agent workflows handle scaffolding, translation pairing, and deployment.

## System architecture

```mermaid
flowchart TB
    classDef layer fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px,color:#0f172a,rx:12px;
    classDef core fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a,rx:12px;
    classDef edge fill:#f0fdf4,stroke:#4ade80,color:#14532d,rx:12px;

    subgraph Authoring ["Authoring layers"]
        Agent[🤖 Agent crew<br/>research → draft → verify → PR]
        Sources[📝 Markdown content<br/>essays / journal / poems]
    end

    subgraph Build ["Build layer"]
        Collections[📚 Content collections<br/>Frontmatter validation]
        Astro[⚙️ Astro + TypeScript<br/>Static rendering]
        Assets[🖼️ Satori images<br/>OG, social, poem cards]
        Metadata[🔗 Redirects, sitemap<br/>RSS, JSON-LD, hreflang]
    end

    subgraph Delivery ["Delivery layer"]
        Pages[☁️ Cloudflare Pages<br/>Static assets and routes]
        Headers[🛡️ _headers<br/>Cache, security response]
        Reader[🌐 Web reader<br/>EN and MS]
        Smoke[🧪 Playwright<br/>Accessibility and routing smoke]
    end

    Agent --> Sources
    Sources --> Collections
    Collections --> Astro
    Astro --> Assets
    Astro --> Metadata
    Astro --> Pages
    Pages --> Headers
    Headers --> Reader
    Smoke --> Reader

    class Authoring,Build,Delivery layer;
    class Astro,Collections,Assets,Metadata core;
    class Pages,Headers,Reader,Smoke edge;
```

This design keeps the content layer plain Markdown while moving predictable outputs — redirects,
feed/canonical metadata, social images, and bilingual pairing validation — into the build layer.

## Features

- Bilingual Markdown content collections for essays, journal entries, and poems
- Language pairs across `en/` and `ms/`, including locational section slugs
- Build-time bilingual pairing validation by `pubDate` plus poem `form`
- Static social and OG image generation with Satori
- Reflow-safe strict poem cards
- Local pinning and horizontal-overflow Playwright smoke tests
- Locale-aware RSS, hreflang, `og:locale:alternate`, and JSON-LD Article metadata
- Long-lived immutable caching for hashed assets, plus baseline security headers

## Develop

```bash
cd cyber-pujangga-site
npm install
npm run dev          # http://localhost:4321
```

Requires Node `>=22.12.0`.

### Quality gates

```bash
npm run check        # content pairing + Astro types
npm run build        # content pairing + redirects + Astro build
npx biome check .    # lint/format checks (non-destructive)
npm test             # Playwright smoke tests
```

### Add content

```bash
./new-piece.sh essay my-new-essay
./new-piece.sh journal 2026-07-14-some-day
./new-piece.sh poem a-quiet-poem --lang ms
```

Content lives as `src/content/{essays,journal,poems}/{en,ms}/*.md`.  
Add or update both language counterparts when a bilingual work is intended;
`npm run check` fails unmatched pieces before Astro builds them.

## Deployment

Auto-deploy happens on pull-request merge to `master` when UI-relevant paths change:

- `src/components/**`, `src/layouts/**`, `src/styles/**`
- `public/**`
- `astro.config.ts`, `src/site.config.ts`

Content-only and script-only changes need a manual build/deploy:

```bash
./deploy.sh
```

This mirrors the neighboring `tech-journal` cleanup pipeline.

## Agentic workflow

The repository ships with shared agent entry points and a content crew:

- `AGENTS.md`, `CLAUDE.md`: conventions and commands
- `CONTEXT.md`: rationale and non-goals
- `PLAN.md`: active and completed work
- `STYLE.md`: voice guidance
- `.claude/skills`: `new-piece`, `deploy-site`, `bilingual-check`
- `.claude/workflows/weekly-content-crew.js`: research → EN/MS draft → verification → PR (never auto-merges)

## License

Personal project. Content and code are not licensed for reuse unless explicitly stated.
