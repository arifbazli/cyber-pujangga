// Helper utilities shared across page templates.

import type { CollectionEntry } from "astro:content";
import { type Locale, isLocale } from "../i18n";

/**
 * Astro 5 + glob loader: the entry id looks like "en/some-slug.md".
 * Extract the language prefix and assert it.
 */
export function localeOf(entry: CollectionEntry<"essays" | "journal" | "poems" | "pages">): Locale {
  const first = entry.id.split("/")[0];
  if (isLocale(first)) return first;
  // For static pages (about.*.md), the locale is embedded in the filename.
  // The Astro glob loader strips the extension and the separator dot,
  // so the id looks like "abouten" or "aboutms".
  const tail = entry.id.split("/").pop() ?? entry.id;
  const m = tail.match(/^(.+?)(ms|en)$/);
  if (m && isLocale(m[2])) return m[2] as Locale;
  // Fall back to default. This should not happen if content is filed correctly.
  return "en";
}

/** Strip the language prefix to get the route slug. */
export function slugOf(entry: CollectionEntry<"essays" | "journal" | "poems" | "pages">): string {
  const parts = entry.id.split("/");
  if (parts.length > 1) {
    // essays/journal/poems: locale is its own path segment ("en/some-slug")
    // — the rest is already the real slug, even if it happens to end in
    // "en"/"ms" (e.g. "the-golden-pen"). No suffix-stripping needed or wanted.
    return parts.slice(1).join("/");
  }
  // Pages (flat folder): the Astro glob loader concatenates the locale tag
  // to the slug with no separator (e.g. "about" + "en" -> "abouten").
  const tail = parts[0];
  const m = tail.match(/^(.+?)(ms|en)$/);
  return m ? m[1] : tail;
}

/** Filter a collection to a single language, sorted newest first, non-drafts. */
export function filterByLocale<
  T extends { data: { draft?: boolean; pubDate?: Date; date?: Date } },
>(entries: T[], locale: Locale, dateField: "pubDate" | "date" = "pubDate"): T[] {
  return entries
    .filter((e) => !e.data.draft && localeOf(e as never) === locale)
    .sort((a, b) => {
      const aDate = (a.data[dateField] ?? a.data.pubDate ?? new Date(0)) as Date;
      const bDate = (b.data[dateField] ?? b.data.pubDate ?? new Date(0)) as Date;
      return bDate.getTime() - aDate.getTime();
    });
}

// Slug-translation pairing (for the language-toggle link) lives in
// ../i18n/index.ts, which is the only place it's used.
