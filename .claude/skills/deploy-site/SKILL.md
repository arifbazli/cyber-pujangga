---
name: deploy-site
description: Build the Astro site, deploy to Cloudflare Pages, and prune old deployments. Use only when explicitly asked to deploy/publish — never proactively.
---

This is a real production deploy. Confirm with the user first if the request is at all ambiguous.

1. From repo root: `./deploy.sh` (`--no-clean` to skip pruning).
2. Requires `CLOUDFLARE_API_TOKEN` in env, or an active `wrangler login` session.
3. Script builds (`npm run build`), runs `wrangler pages deploy ./dist --project-name=cyber-pujangga`, then deletes all prior deployments except the newest via `cf-pages-cleanup.py`.
4. If unsure the site currently builds cleanly, run `npm run check` first.
5. Report the live URL back: `https://cyber-pujangga.pages.dev`.
