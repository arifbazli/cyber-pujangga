// Static default social card (1200×630) used by site/section pages whose
// metadata references /social-card.png. Mirrors the piece OG card design.
import JetBrainsMono from "@/assets/fonts/jetbrainsmono-400.ttf";
import NewsreaderItalic from "@/assets/fonts/newsreader-400-italic.ttf";
import NewsreaderRegular from "@/assets/fonts/newsreader-400.ttf";
import NewsreaderSemiBold from "@/assets/fonts/newsreader-600.ttf";
import { siteConfig } from "@/site.config";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

export async function GET(context: APIContext) {
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

  const markup = html`<div tw="flex flex-col w-full h-full px-20 py-16" style="background-color: #1a1715; font-family: Newsreader;">
		<p tw="text-2xl mb-10 tracking-widest uppercase" style="font-family: JetBrains Mono; color: #c89761;">
			SITE${" · "}Cyber Pujangga
		</p>
		<h1 tw="text-7xl leading-tight mb-10" style="color: #fbf6ec; font-weight: 600;">
			${siteConfig.title}
		</h1>
		<p tw="text-2xl" style="color: #c8b89a; font-style: italic;">
			${siteConfig.description}
		</p>
		<div tw="flex flex-1"></div>
		<div tw="flex justify-end w-full">
			<p tw="text-lg tracking-wide" style="font-family: JetBrains Mono; color: #6b5e4f;">
				${context.site ? new URL(context.site).host : siteConfig.title}
			</p>
		</div>
	</div>`;

  const svg = await satori(markup, ogOptions);
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
