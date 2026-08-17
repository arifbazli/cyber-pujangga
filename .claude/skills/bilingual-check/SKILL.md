---
name: bilingual-check
description: Audit essays/journal/poems for EN/MS structural inconsistencies — missing frontmatter, bad slugs, leftover placeholder text. Use when asked to review/audit bilingual content health.
---

Content: `cyber-pujangga-site/src/content/{essays,journal,poems}/{en,ms}/*.md`. No enforced translation pairing — "inconsistency" means structural problems, not missing translations.

Check per section, against `content.config.ts`'s schema:
- Required frontmatter present (essay/poem: `title`, `description`, `pubDate`, `author`, `tags`; journal adds `date`, `mood`; poem adds `form`).
- `pubDate`/`date` parse as valid ISO 8601.
- Slugs unique and kebab-case within their `{section}/{lang}` folder.
- No leftover scaffold placeholder text (e.g. "Write your essay here.").

Report findings grouped by section/language. Don't auto-fix content — translation/wording decisions are the author's call.
