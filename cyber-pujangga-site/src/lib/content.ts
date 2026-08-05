// Helper utilities shared across page templates.

import { type CollectionEntry, getCollection } from "astro:content";
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
  const tail = parts.slice(1).join("/") || parts[0];
  // For pages (flat folder), strip the trailing locale tag.
  // The Astro glob loader concatenates the locale to the slug with no separator.
  const m = tail.match(/^(.+?)(ms|en)$/);
  if (m) return m[1];
  return tail;
}

/** Read-time estimate (rough: 200 words/min). */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Format a date in the locale's convention. */
export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "ms" ? "ms-MY" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** ISO date for <time datetime="..."> attributes. */
export function isoDate(date: Date): string {
  return date.toISOString();
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

/**
 * Build a slug-translation map from all content collections.
 *
 * Entries that share a `pubDate` (essay/journal) — or `pubDate + form`
 * (poems) — are considered translations of each other.
 *
 * Returns a function that, given a (locale, collection, slug) triple,
 * returns the equivalent (locale, collection, slug) in the *target* locale
 * — or `null` if no translation exists.
 *
 * This is what powers the language-toggle link on piece detail pages,
 * so `/esei/mengenai-kesunyian-membaca` correctly links to
 * `/essays/on-the-quietness-of-reading` (and vice versa).
 */
export async function buildSlugTranslationMap(): Promise<{
  msToEn: Map<string, { collection: string; slug: string }>;
  enToMs: Map<string, { collection: string; slug: string }>;
}> {
  type Key = string; // `${collection}:${slug}`
  const msToEn = new Map<string, { collection: string; slug: string }>();
  const enToMs = new Map<string, { collection: string; slug: string }>();

  const collections: Array<"essays" | "journal" | "poems"> = ["essays", "journal", "poems"];
  for (const collection of collections) {
    const all = await getCollection(collection, ({ data }) => !data.draft);
    // Group by translation key: pubDate + form (for poems).
    const msByKey = new Map<string, CollectionEntry<typeof collection>>();
    const enByKey = new Map<string, CollectionEntry<typeof collection>>();
    for (const e of all) {
      const loc = localeOf(e);
      if (loc !== "ms" && loc !== "en") continue;
      const d = e.data.pubDate ?? e.data.date;
      if (!d) continue;
      const formKey =
        collection === "poems" && (e.data as { form?: string }).form
          ? `:${(e.data as { form?: string }).form}`
          : "";
      const key = `${d.toISOString().slice(0, 10)}${formKey}`;
      if (loc === "ms") msByKey.set(key, e);
      else enByKey.set(key, e);
    }
    for (const [key, msEntry] of msByKey) {
      const enEntry = enByKey.get(key);
      if (!enEntry) continue;
      const msSlug = slugOf(msEntry);
      const enSlug = slugOf(enEntry);
      msToEn.set(`${collection}:${msSlug}`, { collection, slug: enSlug });
      enToMs.set(`${collection}:${enSlug}`, { collection, slug: msSlug });
    }
  }
  return { msToEn, enToMs };
}

/**
 * Look up the translation of a (collection, slug) pair in the target locale.
 * Returns `null` if no translation exists.
 */
export function lookupTranslation(
  map: Awaited<ReturnType<typeof buildSlugTranslationMap>>,
  fromLocale: Locale,
  collection: "essays" | "journal" | "poems",
  slug: string,
): { collection: "essays" | "journal" | "poems"; slug: string } | null {
  const m = fromLocale === "ms" ? map.msToEn : map.enToMs;
  return m.get(`${collection}:${slug}`) ?? null;
}
