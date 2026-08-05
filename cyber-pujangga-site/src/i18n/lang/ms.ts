// Bahasa Melayu UI strings
// Convention: keep the SAME key structure as en.ts so lookups stay simple.

import type { Strings } from "./en"

export const ms: Strings = {
  site: {
    title: "Cyber Pujangga",
    tagline: "Esei, jurnal harian, dan sajak — dalam dua bahasa",
    description:
      "Tulisan peribadi merentasi dua bahasa: esei, nota harian, dan sajak.",
  },

  nav: {
    home: "Laman",
    back: "Kembali ke Laman",
    essays: "Esei",
    journal: "Jurnal",
    poems: "Sajak",
    about: "Perihal",
    language: "Bahasa",
  },

  section: {
    essays: "Esei",
    journal: "Jurnal",
    poems: "Sajak",
  },

  // Hero block (mockup v3)
  hero: {
    title: "Tulisan peribadi, {plain}, satu suara merentasi dua bahasa.",
    plain: "dibuka perlahan",
    ctaPrimary: "Baca tulisan terkini",
    ctaSecondary: "Lihat arkib",
  },

  landingStrip: {
    lastUpdated: "Kemas kini terakhir · {date}",
  },

  featured: {
    label: "Catatan terkini",
    readFullEssay: "baca esei penuh →",
    readFullJournal: "baca jurnal penuh →",
    readFullPoem: "baca sajak penuh →",
  },

  seeAll: "Semua catatan dalam Arkib →",

  piece: {
    backTo: "Kembali ke",
  },

  theme: {
    toggleAria: "Tukar mod terang/gelap",
    menuAria: "Buka menu",
    menuCloseAria: "Tutup menu",
    skipLabel: "Langkau ke kandungan",
    switchLangAria: "Tukar ke Bahasa Inggeris",
    rssPath: (lang: "ms" | "en") => (lang === "ms" ? "/rss.xml" : "/en/rss.xml"),
  },

  footer: {
    about: "Perihal",
  },

  misc: {
    notFound: "Halaman tidak dijumpai.",
    home: "Kembali ke Laman",
  },
} as const