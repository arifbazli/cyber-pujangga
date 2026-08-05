// Content collection schemas for Cyber Pujangga.
// Three collections: essays, journal (daily), poems.
// Each piece is written in ONE language per file; the language is determined
// by the folder it lives in (en/ or ms/) — see the `loader` pattern below.

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ----- Essays -----
// Longer reflective / argumentative pieces.
const essays = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/essays" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Cyber Pujangga"),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// ----- Journal (daily short entries) -----
// Short, dated entries. `date` is the journal entry date (not publish date).
const journal = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/journal" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(), // when the entry was written
    pubDate: z.coerce.date(), // when published on the site
    mood: z.string().optional(), // free-form: "thoughtful", "tired", etc.
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// ----- Poems -----
// Verse pieces with extra structure for forms/dedications.
const poems = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/poems" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.string().default("Cyber Pujangga"),
    form: z
      .enum(["free-verse", "sonnet", "pantoum", "haiku", "pantun", "syair", "other"])
      .default("free-verse"),
    dedication: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // If true, mobile (<400px) shows a static image-card fallback instead of
    // re-flowed text — useful for forms where line breaks are structurally
    // important (pantoum, pantun, syair, haiku).
    strictLayout: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// ----- Static pages (about, etc.) -----
// Per-language files named: about.en.md, about.ms.md
const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
  }),
});

export const collections = { essays, journal, poems, pages };
