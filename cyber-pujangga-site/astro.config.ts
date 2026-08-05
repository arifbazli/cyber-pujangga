// Cyber Pujangga — bilingual (Malay / English) literature site
// Hosted on Cloudflare Pages: https://cyber-pujangga.pages.dev
// i18n is handled manually via src/i18n/ — no Astro built-in i18n block.

import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import { expressiveCodeOptions } from "./src/site.config";

import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";

import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";

export default defineConfig({
	site: "https://cyber-pujangga.pages.dev",
	base: "/",
	output: "static",
	compressHTML: true,
	trailingSlash: "never",
	build: {
		inlineStylesheets: "always",
	},
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		sitemap({
			changefreq: "weekly",
			priority: 0.7,
			lastmod: new Date(),
		}),
		mdx(),
		robotsTxt(),
	],
	// Astro 7 defaults to Sätteri; opt back into remark/rehype.
	markdown: {
		processor: unified({
			rehypePlugins: [
				rehypeUnwrapImages,
				[
					rehypeExternalLinks,
					{
						rel: ["nofollow", "noreferrer"],
						target: "_blank",
					},
				],
			],
			remarkPlugins: [remarkReadingTime, remarkDirective, remarkAdmonitions],
			remarkRehype: {
				footnoteLabelProperties: {
					className: [""],
				},
			},
		}),
	},
	prefetch: true,
	vite: {
		plugins: [rawFonts()],
	},
});

function rawFonts() {
	return {
		name: "vite-plugin-raw-fonts",
		transform(_code: string, id: string) {
			if (id.endsWith(".ttf") || id.endsWith(".woff") || id.endsWith(".woff2")) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
			return null;
		},
	};
}