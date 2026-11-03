#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");

function list(dir) {
  try {
    return readdirSync(resolve(siteRoot, "src/content", dir))
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const text = readFileSync(resolve(siteRoot, "src/content", dir, f), "utf8");
        const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        const fm = match?.[1] ?? "";
        const raw =
          fm.match(/^pubDate:\s*(.+)$/m)?.[1]?.trim() ?? fm.match(/^date:\s*(.+)$/m)?.[1]?.trim();
        const form = fm
          .match(/^form:\s*(.+)$/m)?.[1]
          ?.trim()
          ?.replace(/^['"]|['"]$/g, "");
        const normalizedDate = raw ? new Date(raw).toISOString().slice(0, 10) : null;
        return {
          slug: f.replace(/\.md$/, ""),
          key: normalizedDate
            ? `${normalizedDate}${form ? `:${form}` : ""}`
            : f.replace(/\.md$/, ""),
        };
      });
  } catch {
    return [];
  }
}

const collections = ["essays", "journal", "poems"];

let problems = 0;
for (const collection of collections) {
  const ms = list(`${collection}/ms`);
  const en = list(`${collection}/en`);
  const byKey = { ms: new Map(), en: new Map() };
  for (const item of ms) byKey.ms.set(item.key, item);
  for (const item of en) byKey.en.set(item.key, item);

  for (const [key, msItem] of byKey.ms) {
    if (!byKey.en.has(key)) {
      console.warn(`missing EN counterpart: ${collection}/ms/${msItem.slug} (${key})`);
      problems += 1;
    }
  }
  for (const [key, enItem] of byKey.en) {
    if (!byKey.ms.has(key)) {
      console.warn(`missing MS counterpart: ${collection}/en/${enItem.slug} (${key})`);
      problems += 1;
    }
  }
  console.log(
    `${collection}: ${byKey.ms.size} MS / ${byKey.en.size} EN, matched ${ms.filter((m) => byKey.en.has(m.key)).length}`,
  );
}

if (problems > 0) {
  console.error(`content pairing check failed: ${problems} unmatched piece(s)`);
  process.exit(1);
}
console.log("content pairing check passed");
