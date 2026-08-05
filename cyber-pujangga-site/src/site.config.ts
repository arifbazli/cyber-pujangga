// Cyber Pujangga — site-wide configuration.
// Consumed by astro.config.ts, BaseHead.astro, Footer.astro.
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export interface SiteConfig {
	/** Displayed in <title> and OG tags. */
	title: string;
	description: string;
	author: string;
	siteUrl: string;
}

export const siteConfig: SiteConfig = {
	title: "Cyber Pujangga",
	description:
		"Personal writing across two languages: essays, daily notes, and poems.",
	author: "Cyber Pujangga",
	siteUrl: "https://cyber-pujangga.pages.dev",
};

// ── Bilingual navigation ──────────────────────────────────────────────────
// Active menu links live in src/i18n/index.ts (menuLinksMs / menuLinksEn)
// — those are the source of truth consumed by Header.astro.

// ── Expressive Code (code-block syntax highlighting) ──────────────────────

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		codeBackground: ({ theme }: any) => (theme.type === "light" ? "#f0e9d6" : "#1a1715"),
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
		codeFontSize: "0.875rem",
		codeLineHeight: "1.7142857rem",
		codePaddingInline: "1rem",
		frames: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			editorActiveTabBackground: ({ theme }: any) =>
				theme.type === "light" ? "#f0e9d6" : "#1a1715",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			editorTabBarBackground: ({ theme }: any) =>
				theme.type === "light" ? "#ebe3cd" : "#15120e",
			frameBoxShadowCssValue: "none",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			terminalBackground: ({ theme }: any) =>
				theme.type === "light" ? "#f0e9d6" : "#1a1715",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			terminalTitlebarBackground: ({ theme }: any) =>
				theme.type === "light" ? "#ebe3cd" : "#15120e",
		},
		uiLineHeight: "inherit",
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	themeCssSelector(theme: any, { styleVariants }: any) {
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find(
				(v: any) => v.theme.type !== baseTheme?.type,
			)?.theme;
			if (theme === baseTheme || theme === altTheme)
				return `[data-theme='${theme.type}']`;
		}
		return `[data-theme="${theme.name}"]`;
	},
	themes: ["min-dark", "min-light"],
	useThemedScrollbars: false,
};