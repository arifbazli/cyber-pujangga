// Poem mobile-fallback image generator.
// Renders the full poem body onto a portrait-sized PNG card used as a
// fallback at <400px viewport width when the poem's line structure is
// structurally important (frontmatter `strictLayout: true`).
//
// Output dimensions: 800x1100 — fits a phone width without scaling artifacts.

import NewsreaderRegular from "@/assets/fonts/newsreader-400.ttf";
import NewsreaderItalic from "@/assets/fonts/newsreader-400-italic.ttf";
import NewsreaderSemiBold from "@/assets/fonts/newsreader-600.ttf";
import JetBrainsMono from "@/assets/fonts/jetbrainsmono-400.ttf";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import { getCollection } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const poemCardOptions: SatoriOptions = {
	fonts: [
		{ data: Buffer.from(NewsreaderRegular), name: "Newsreader", style: "normal", weight: 400 },
		{ data: Buffer.from(NewsreaderSemiBold), name: "Newsreader", style: "normal", weight: 600 },
		{ data: Buffer.from(NewsreaderItalic), name: "Newsreader", style: "italic", weight: 400 },
		{ data: Buffer.from(JetBrainsMono), name: "JetBrains Mono", style: "normal", weight: 400 },
	],
	height: 1100,
	width: 800,
};

const SEP = " · ";

const poemMarkup = (props: {
	title: string;
	body: string;
	author: string;
	pubDate: string;
	form: string;
	host: string;
	locale: string;
}) => {
	// Split body into lines; preserve blank lines as stanza breaks.
	const lines = props.body.split("\n");
	const lineNodes = lines.map((line) => {
		if (line.trim() === "") {
			return html`<div tw="h-6"></div>`;
		}
		return html`<p tw="text-3xl leading-relaxed mb-3" style="font-family: Newsreader; color: #ece7da;">
			${line}
		</p>`;
	});

	return html`<div tw="flex flex-col w-full h-full px-16 py-14" style="background-color: #1b1a17; font-family: Newsreader;">
		<p tw="text-base tracking-widest uppercase mb-8" style="font-family: JetBrains Mono; color: #c89761;">
			${props.form}${SEP}${props.pubDate}
		</p>
		<h1 tw="text-4xl leading-tight mb-10" style="color: #fbf6ec; font-weight: 600;">
			${props.title}
		</h1>
		<div tw="flex flex-col flex-1">${lineNodes}</div>
		<div tw="flex flex-col w-full mt-6">
			<p tw="text-base mb-1" style="font-family: JetBrains Mono; color: #a8a294;">
				${props.author}
			</p>
			<p tw="text-sm tracking-wide" style="font-family: JetBrains Mono; color: #6b6659;">
				${props.host}
			</p>
		</div>
	</div>`;
};

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { title, body, author, pubDate, form, locale } = context.props as Props;

	const host = context.site
		? new URL(context.site).host
		: "cyber-pujangga.pages.dev";

	const formattedDate = new Date(pubDate).toLocaleDateString(
		locale === "ms" ? "ms-MY" : "en-US",
		{ year: "numeric", month: "short", day: "numeric" },
	);

	const svg = await satori(
		poemMarkup({
			title,
			body,
			author,
			pubDate: formattedDate,
			form,
			host,
			locale,
		}),
		poemCardOptions,
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
	const poems = await getCollection("poems", ({ data }) => !data.draft);

	// Build body string per poem (strip YAML frontmatter, keep line breaks).
	const stripFrontmatter = (raw: string): string => {
		const match = raw.match(/^---\n[\s\S]*?\n---\n?/);
		const body = match ? raw.slice(match[0].length) : raw;
		return body.trim();
	};

	return poems.map((entry) => {
		const idParts = entry.id.split("/");
		const locale = idParts[0] === "ms" || idParts[0] === "en" ? idParts[0] : "ms";
		return {
			params: { slug: `${entry.id}` },
			props: {
				title: entry.data.title,
				body: stripFrontmatter(entry.body ?? ""),
				author: entry.data.author ?? "Cyber Pujangga",
				pubDate: entry.data.pubDate.toISOString(),
				form: entry.data.form,
				locale,
			},
		};
	});
}