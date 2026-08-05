export interface ProfileConfig {
	/** Author display name; used in bylines, schema, OG images. */
	name: string;
	/** Contact email shown in About-page socials. Omit to hide. */
	email?: string;
	/** Profile URL on GitHub. Leave empty to hide. */
	github?: string;
	/** Profile URL on LinkedIn. Leave empty to hide. */
	linkedin?: string;
	/** Twitter / X profile URL. Leave empty to hide. */
	twitter?: string;
	/** Mastodon profile URL. Leave empty to hide. */
	mastodon?: string;
	/** Schema.org Person.jobTitle. */
	jobTitle?: string;
	/** Schema.org Person.worksFor.name (current employer). */
	employer?: string;
	/** Schema.org Person.worksFor.url. */
	employerUrl?: string;
	/** Schema.org Person.alumniOf.name. */
	alumni?: string;
	/** Absolute avatar/photo URL used in schema markup. */
	avatar?: string;
}

export interface SiteConfig {
	/** Site-wide display name; fallback for profile.name. */
	author: string;
	date: {
		locale: string | string[] | undefined;
		options: Intl.DateTimeFormatOptions;
	};
	/** Primary (Malay) site description. */
	description: string;
	/** Optional English site description for /en pages. */
	descriptionEn?: string;
	lang: string;
	ogLocale: string;
	sortPostsByUpdatedDate: boolean;
	title: string;
	/** Personal info for About page, schema, byline. */
	profile?: ProfileConfig;
	/** Set true to hide the "Built with Astro Sienna" footer credit. */
	hideThemeCredit?: boolean;
}

export interface SiteMeta {
	articleDate?: string | undefined;
	description?: string;
	ogImage?: string | undefined;
	title: string;
	/** BCP-47 locale tag for the current page (e.g. "ms-MY" or "en-US"). */
	lang?: string;
}

/**
 * Bilingual navigation link shape.
 * Used by menuLinksMs and menuLinksEn in site.config.ts.
 * { path: string; title: string }[]
 */
export type MenuLink = {
	path: string;
	title: string;
};

export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";
