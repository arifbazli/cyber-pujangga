// Cyber Pujangga — bilingual (Malay / English) literature site
// Hosted on Cloudflare Pages: https://cyber-pujangga.pages.dev
// i18n is handled manually via src/i18n/ — no Astro built-in i18n block.

import fs from "node:fs";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import { expressiveCodeOptions } from "./src/site.config";

import remarkDirective from "remark-directive";
import { rehypeBasePath } from "./src/plugins/rehype-base-path";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";

import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";

const base = "/";

const sectionCollection = {
  essays: ["essays", "en"],
  esei: ["essays", "ms"],
  journal: ["journal", "en"],
  jurnal: ["journal", "ms"],
  poems: ["poems", "en"],
  sajak: ["poems", "ms"],
} as Record<string, [string, string]>;

function pieceLastmod(pathname: string): Date | undefined {
  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length < 2) return undefined;
  const [section, slug] = [parts[0], parts[1]];
  const mapping = sectionCollection[section];
  if (!mapping) return undefined;
  const [collection, locale] = mapping;
  const filePath = `./src/content/${collection}/${locale}/${slug}.md`;
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) return undefined;
    const updated =
      fm[1].match(/^updatedDate:\s*(.+)$/m)?.[1]?.trim() ??
      fm[1].match(/^pubDate:\s*(.+)$/m)?.[1]?.trim() ??
      fm[1].match(/^date:\s*(.+)$/m)?.[1]?.trim();
    if (!updated) return undefined;
    const d = new Date(updated);
    return Number.isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

export default defineConfig({
  site: "https://cyber-pujangga.pages.dev",
  base,
  output: "static",
  compressHTML: true,
  trailingSlash: "never",
  build: {
    inlineStylesheets: "never",
  },
  integrations: [
    expressiveCode(expressiveCodeOptions),
    icon(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      serialize(item) {
        const pathname = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const lm = pieceLastmod(pathname);
        return lm ? { ...item, lastmod: lm.toISOString() } : item;
      },
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
        [rehypeBasePath, { base }],
      ],
      remarkPlugins: [remarkDirective, remarkAdmonitions],
      remarkRehype: {
        footnoteLabelProperties: {
          className: [""],
        },
      },
    }),
  },
  prefetch: true,
  vite: {
    build: { assetsInlineLimit: 0 },
    plugins: [rawFonts()],
  },
});

function rawFonts() {
  return {
    name: "vite-plugin-raw-fonts",
    transform(_code: string, id: string) {
      if (
        id.includes("/src/assets/fonts/") &&
        (id.endsWith(".ttf") || id.endsWith(".woff") || id.endsWith(".woff2"))
      ) {
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
