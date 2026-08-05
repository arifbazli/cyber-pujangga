// OG image generator for Cyber Pujangga.
// Generates 1200×630 PNG cards for all non-draft essays, journal entries, and
// poems across both locales (en/ and ms/).
// Font files are loaded from src/assets/fonts/ via Vite's raw-font plugin.

import { getCollection } from "astro:content";
import JetBrainsMono from "@/assets/fonts/jetbrainsmono-400.ttf";
import NewsreaderItalic from "@/assets/fonts/newsreader-400-italic.ttf";
import NewsreaderRegular from "@/assets/fonts/newsreader-400.ttf";
import NewsreaderSemiBold from "@/assets/fonts/newsreader-600.ttf";
import { siteConfig } from "@/site.config";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const ogOptions: SatoriOptions = {
  fonts: [
    { data: Buffer.from(NewsreaderRegular), name: "Newsreader", style: "normal", weight: 400 },
    { data: Buffer.from(NewsreaderSemiBold), name: "Newsreader", style: "normal", weight: 600 },
    { data: Buffer.from(NewsreaderItalic), name: "Newsreader", style: "italic", weight: 400 },
    { data: Buffer.from(JetBrainsMono), name: "JetBrains Mono", style: "normal", weight: 400 },
  ],
  height: 630,
  width: 1200,
};

const SEP = " · ";

/** Pick a font-size class based on title length. */
const titleClass = (title: string) =>
  title.length > 80
    ? "text-5xl leading-tight mb-10"
    : title.length > 55
      ? "text-6xl leading-tight mb-10"
      : "text-7xl leading-tight mb-10";

/** Satori markup — dark parchment background, Newsreader headings. */
const markup = (props: {
  collection: string;
  title: string;
  pubDate: string;
  host: string;
}) =>
  html`<div tw="flex flex-col w-full h-full px-20 py-16" style="background-color: #1a1715; font-family: Newsreader;">
		<p tw="text-2xl mb-10 tracking-widest uppercase" style="font-family: JetBrains Mono; color: #c89761;">
			${props.collection}${SEP}${props.pubDate}
		</p>
		<h1 tw="${titleClass(props.title)}" style="color: #fbf6ec; font-weight: 600;">
			${props.title}
		</h1>
		<div tw="flex flex-1"></div>
		<div tw="flex justify-end w-full">
			<p tw="text-lg tracking-wide" style="font-family: JetBrains Mono; color: #6b5e4f;">
				${props.host}
			</p>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
  const { title, pubDate, collection } = context.props as Props;

  const host = context.site ? new URL(context.site).host : siteConfig.title;

  const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const svg = await satori(
    markup({
      collection,
      title,
      pubDate: formattedDate,
      host,
    }),
    ogOptions,
  );

  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}

export async function getStaticPaths() {
  // Collect all non-draft entries from all three collections, both locales.
  const [essays, journal, poems] = await Promise.all([
    getCollection("essays", ({ data }) => !data.draft),
    getCollection("journal", ({ data }) => !data.draft),
    getCollection("poems", ({ data }) => !data.draft),
  ]);

  const essayItems = essays.map((entry) => ({
    params: { slug: `essays/${entry.id}` },
    props: {
      title: entry.data.title,
      pubDate: entry.data.pubDate.toISOString(),
      collection: "Essays",
    },
  }));

  const journalItems = journal.map((entry) => ({
    params: { slug: `journal/${entry.id}` },
    props: {
      title: entry.data.title,
      pubDate: (entry.data.pubDate ?? entry.data.date).toISOString(),
      collection: "Journal",
    },
  }));

  const poemItems = poems.map((entry) => ({
    params: { slug: `poems/${entry.id}` },
    props: {
      title: entry.data.title,
      pubDate: entry.data.pubDate.toISOString(),
      collection: "Poems",
    },
  }));

  return [...essayItems, ...journalItems, ...poemItems];
}
