// i18n lookup utilities
// Usage:
//   import { t, isLocale, defaultLocale } from "@/i18n"
//   const strings = t("ms")   // -> typeof ms
//   if (isLocale(lang)) { ... }

import { type CollectionEntry, getCollection } from "astro:content";
import { type Strings, en } from "./lang/en";
import { ms } from "./lang/ms";

export const defaultLocale = "en" as const;
export const locales = ["en", "ms"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, Strings> = { en, ms };

/**
 * Look up UI strings for a locale.
 * Falls back to English if the locale string is not recognized,
 * so a typo in a route param never crashes the build.
 */
export function t(locale: string | undefined): Strings {
  if (locale && locale in dictionaries) {
    return dictionaries[locale as Locale];
  }
  return dictionaries[defaultLocale];
}

/** Type guard for locale strings (useful in getStaticPaths). */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Build a URL — no language prefix for either locale.
 * Section slugs differ per language (esei vs essays, etc.).
 * Malay home = /, English home = /en
 */
export function localePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\//, "").replace(/\/$/, "");
  if (!clean) return locale === "en" ? "/en" : "/";
  return `/${clean}`;
}

// Map MS section-prefix → EN section-prefix, and vice versa.
const sectionMap = {
  ms: { esei: "essays", jurnal: "journal", sajak: "poems", tentang: "about" } as Record<
    string,
    string
  >,
  en: { essays: "esei", journal: "jurnal", poems: "sajak", about: "tentang" } as Record<
    string,
    string
  >,
};

/**
 * Build a map of MS-content-slug → EN-content-slug (and reverse).
 * Pairs are matched by pubDate (+ form for poems), since both halves
 * of a translation share those fields.
 *
 * Built once at module load (top-level await runs at build time).
 */
const slugTranslationMap = await buildSlugTranslationMap();

async function buildSlugTranslationMap() {
  const msToEn = new Map<string, { collection: string; slug: string }>();
  const enToMs = new Map<string, { collection: string; slug: string }>();
  const collections = ["essays", "journal", "poems"] as const;
  for (const collection of collections) {
    const all = await getCollection(collection, ({ data }) => !data.draft);
    const byKey = {
      ms: new Map<string, CollectionEntry<typeof collection>>(),
      en: new Map<string, CollectionEntry<typeof collection>>(),
    };
    for (const e of all) {
      const first = e.id.split("/")[0];
      const loc = first === "ms" || first === "en" ? first : null;
      if (!loc) continue;
      const d = e.data.pubDate;
      if (!d) continue;
      const formKey =
        collection === "poems" && (e.data as { form?: string }).form
          ? `:${(e.data as { form?: string }).form}`
          : "";
      // Pair by full timestamp (not just date) so multiple pieces posted on
      // the same calendar day still resolve to their correct translation.
      // The MS and EN halves of a translation must share the exact timestamp.
      const key = `${d.toISOString()}${formKey}`;
      byKey[loc].set(key, e);
    }
    for (const [key, msEntry] of byKey.ms) {
      const enEntry = byKey.en.get(key);
      if (!enEntry) continue;
      const msSlug = slugOf(msEntry);
      const enSlug = slugOf(enEntry);
      msToEn.set(`${collection}:${msSlug}`, { collection, slug: enSlug });
      enToMs.set(`${collection}:${enSlug}`, { collection, slug: msSlug });
    }
  }
  return { msToEn, enToMs };
}

function slugOf(entry: CollectionEntry<"essays" | "journal" | "poems" | "pages">): string {
  return entry.id
    .split("/")
    .slice(1)
    .join("/")
    .replace(/\.(md|mdx)$/, "");
}

/**
 * Build the alternate-language URL for the current page.
 *
 * Maps Malay section slugs ↔ English section slugs, AND translates the
 * content slug so that, e.g., `/esei/mengenai-kesunyian-membaca` correctly
 * links to `/essays/on-the-quietness-of-reading` (not to a 404).
 *
 * Falls back to the locale home (or `/en` for EN) if no translation exists.
 */
export function alternateLocalePath(currentLocale: Locale, path: string): string {
  const target: Locale = currentLocale === "en" ? "ms" : "en";
  const sectionTranslation = sectionMap[currentLocale];
  const slugMap = currentLocale === "ms" ? slugTranslationMap.msToEn : slugTranslationMap.enToMs;

  // Normalize the path: strip leading/trailing slashes
  let cleanPath = path.replace(/^\//, "").replace(/\/$/, "");

  // Strip the "/en" prefix on English pages so paths are comparable
  if (cleanPath === "en" || cleanPath.startsWith("en/")) {
    cleanPath = cleanPath === "en" ? "" : cleanPath.slice(3);
  }

  // If we're on the locale home, swap to the other locale's home
  if (cleanPath === "") {
    return target === "en" ? "/en" : "/";
  }

  const parts = cleanPath.split("/").filter(Boolean);
  const section = parts[0] ?? "";
  const slug = parts[1] ?? "";

  // Translate section (esei ↔ essays, etc.)
  const targetSection = sectionTranslation[section] ?? section;

  // Translate slug if we have a mapping for this section.
  let targetSlug = slug;
  const collectionKey = inferCollection(section);
  if (collectionKey && slug) {
    const translated = slugMap.get(`${collectionKey}:${slug}`);
    if (translated) targetSlug = translated.slug;
  }

  // Assemble final path
  let result = targetSection;
  if (targetSlug) result += "/" + targetSlug;

  // If we ended up with no path, return the locale home
  if (!result) return target === "en" ? "/en" : "/";
  return `/${result}`;
}

/** Reverse-map a locale-prefixed section back to its collection name. */
function inferCollection(section: string): "essays" | "journal" | "poems" | null {
  if (section === "esei" || section === "essays") return "essays";
  if (section === "jurnal" || section === "journal") return "journal";
  if (section === "sajak" || section === "poems") return "poems";
  return null;
}

/** Primary nav links, Malay — order matches the mockup. */
export const menuLinksMs: Array<{ href: string; label: string }> = [
  { href: "/", label: "Laman" },
  { href: "/esei", label: "Esei" },
  { href: "/jurnal", label: "Jurnal" },
  { href: "/sajak", label: "Sajak" },
  { href: "/tentang", label: "Perihal" },
];

/** Primary nav links, English. */
export const menuLinksEn: Array<{ href: string; label: string }> = [
  { href: "/en", label: "Home" },
  { href: "/essays", label: "Essays" },
  { href: "/journal", label: "Journal" },
  { href: "/poems", label: "Poems" },
  { href: "/en/about", label: "About" },
];
