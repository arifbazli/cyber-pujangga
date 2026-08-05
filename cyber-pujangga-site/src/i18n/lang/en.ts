// English UI strings
// Convention: keep keys flat and grouped by section for easy scanning.

export const en = {
  // Site
  site: {
    title: "Cyber Pujangga",
    tagline: "Essays, daily journal, and poetry — in two languages",
    description: "Personal writing across two languages: essays, daily notes, and poems.",
  },

  // Navigation
  nav: {
    home: "Home",
    back: "Back to Home",
    essays: "Essays",
    journal: "Journal",
    poems: "Poems",
    about: "About",
    language: "Language",
  },

  // Section headings (used on landing + section pages)
  section: {
    essays: "Essays",
    journal: "Journal",
    poems: "Poems",
  },

  // Hero block (mockup v3)
  hero: {
    title: "Personal writing, {plain}, one voice across two languages.",
    plain: "shared quietly",
    ctaPrimary: "Read the latest",
    ctaSecondary: "Browse the archive",
  },

  landingStrip: {
    lastUpdated: "Last updated · {date}",
  },

  featured: {
    label: "Latest entry",
    readFullEssay: "Read the full essay →",
    readFullJournal: "Read the full journal →",
    readFullPoem: "Read the full poem →",
  },

  seeAll: "All entries in the Archive →",

  // Piece meta
  piece: {
    backTo: "Back to",
  },

  // Theme / chrome
  theme: {
    toggleAria: "Toggle light/dark mode",
    menuAria: "Open menu",
    menuCloseAria: "Close menu",
    skipLabel: "Skip to content",
    switchLangAria: "Switch to Malay",
    rssPath: (lang: "ms" | "en") => (lang === "ms" ? "/rss.xml" : "/en/rss.xml"),
  },

  // Footer
  footer: {
    about: "About",
  },

  // Misc
  misc: {
    notFound: "Page not found.",
    home: "Return home",
  },
} as const;

export type Strings = typeof en;
