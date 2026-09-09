---
name: bilingual-check
description: Audit essays/journal/poems for EN/MS structural inconsistencies — missing frontmatter, bad slugs, leftover placeholder text. Use when asked to review/audit bilingual content health.
---

Content lives at `cyber-pujangga-site/src/content/{essays,journal,poems}/{en,ms}/*.md`. No enforced translation pairing — "inconsistency" means structural problems, not missing translations.

Check per section, against `content.config.ts`'s schema:
- Actually-required fields are minimal (`title` + `pubDate`, journal also needs `date`) — everything else (`description`, `author`, `tags`, poem's `form`/`strictLayout`, journal's `mood`) is optional or schema-defaulted, so a build won't fail without them. Still flag missing/placeholder values as a *content-health* issue (house style expects them filled in), just don't describe them as schema violations.
- `pubDate`/`date` parse as valid ISO 8601.
- Slugs unique and kebab-case within their `{section}/{lang}` folder.
- No leftover scaffold placeholder text (e.g. "Write your essay here.").

Report findings grouped by section/language. Don't auto-fix content — wording/translation decisions are the author's call.
