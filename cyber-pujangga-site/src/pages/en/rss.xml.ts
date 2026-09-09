import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { t } from "../../i18n";
import { filterByLocale, slugOf } from "../../lib/content";

export async function GET(context: APIContext) {
  const strings = t("en");
  const [essays, journal, poems] = await Promise.all([
    getCollection("essays", ({ data }) => !data.draft),
    getCollection("journal", ({ data }) => !data.draft),
    getCollection("poems", ({ data }) => !data.draft),
  ]);
  const items = [
    ...filterByLocale(essays, "en").map((e) => ({
      title: e.data.title,
      pubDate: e.data.pubDate,
      description: e.data.description ?? "",
      link: `/essays/${slugOf(e)}`,
    })),
    ...filterByLocale(journal, "en", "date").map((j) => ({
      title: j.data.title,
      pubDate: j.data.pubDate,
      description: j.data.description ?? "",
      link: `/journal/${slugOf(j)}`,
    })),
    ...filterByLocale(poems, "en").map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description ?? `${p.data.form} poem`,
      link: `/poems/${slugOf(p)}`,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${strings.site.title} — ${strings.site.tagline}`,
    description: strings.site.description,
    site: context.site ?? "https://cyber-pujangga.pages.dev",
    items,
    customData: `<language>en-us</language>`,
  });
}
