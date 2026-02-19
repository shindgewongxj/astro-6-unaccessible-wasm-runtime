import sourceImage from "../../assets/og-background.png";
import { SITE_DESCRIPTION, SITE_TITLE } from "../../consts";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 200;

export const prerender = false;

const toAbsoluteAssetUrl = (assetPath, requestUrl) =>
	new URL(assetPath, requestUrl).toString();

const sanitizeOgText = (value, fallback, maxLength) => {
	if (typeof value !== "string") {
		return fallback;
	}

	const normalized = value.replace(/\s+/g, " ").trim();
	if (!normalized) {
		return fallback;
	}

	if (normalized.length <= maxLength) {
		return normalized;
	}

	return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};

const createCacheKey = (url, title, description) => {
	const params = new URLSearchParams({ title, description });
	return new Request(
		new URL(`/og-image/cache.png?${params.toString()}`, url.origin),
		{
			method: "GET",
		},
	);
};

const escapeXml = (text) =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

const fallbackResponse = (title, description) => {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
<rect width="100%" height="100%" fill="#0f0f10"/>
<text x="64" y="250" fill="#fff" font-size="72" font-family="sans-serif" font-weight="700">${escapeXml(title)}</text>
<text x="64" y="340" fill="rgba(255,255,255,0.85)" font-size="34" font-family="sans-serif">${escapeXml(description)}</text>
</svg>`;

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": import.meta.env.DEV
				? "no-store"
				: "public, max-age=300",
		},
	});
};

export async function GET({ url }) {
	if (
		url.searchParams.has("/title") ||
		url.searchParams.has("/description") ||
		url.searchParams.has("/subtitle")
	) {
		return new Response(
			"Invalid OG query params. Use /og-image?title=...&description=...",
			{
				status: 400,
				headers: {
					"Cache-Control": "public, max-age=300",
				},
			},
		);
	}

	const rawTitle = url.searchParams.get("title");
	const rawDescription =
		url.searchParams.get("description") ??
		url.searchParams.get("subtitle");
	const title = sanitizeOgText(rawTitle, SITE_TITLE, TITLE_MAX_LENGTH);
	const description = sanitizeOgText(
		rawDescription,
		SITE_DESCRIPTION,
		DESCRIPTION_MAX_LENGTH,
	);

	let ImageResponse;
	try {
		({ ImageResponse } = await import(
			"@cloudflare/pages-plugin-vercel-og/api"
		));
  } catch (error) {
    throw error;
	}

	const cache = import.meta.env.DEV ? null : globalThis.caches?.default;
	const cacheKey = cache ? createCacheKey(url, title, description) : null;
	if (cache && cacheKey) {
		const cached = await cache.match(cacheKey);
		if (cached) {
			return cached;
		}
	}

	let response;
	try {
		response = new ImageResponse(
			{
				type: "div",
				props: {
					style: {
						width: "100%",
						height: "100%",
						display: "flex",
						position: "relative",
						flexDirection: "column",
						justifyContent: "space-between",
						padding: "64px",
						backgroundColor: "#0f0f10",
						color: "#ffffff",
						fontFamily: "sans-serif",
					},
					children: [
						{
							type: "img",
							props: {
								src: toAbsoluteAssetUrl(sourceImage, url),
								width: OG_WIDTH,
								height: OG_HEIGHT,
								style: {
									position: "absolute",
									inset: 0,
									width: `${OG_WIDTH}px`,
									height: `${OG_HEIGHT}px`,
									objectFit: "cover",
								},
							},
							key: null,
						},
						{
							type: "div",
							props: {
								style: {
									position: "absolute",
									inset: 0,
									background: "rgba(0, 0, 0, 0.55)",
								},
							},
							key: null,
						},
						{
							type: "div",
							props: {
								style: {
									position: "relative",
									display: "flex",
									flexDirection: "column",
									gap: "20px",
									maxWidth: "900px",
								},
								children: [
									{
										type: "div",
										props: {
											style: {
												fontSize: "68px",
												lineHeight: 1,
												fontWeight: 700,
											},
											children: title,
										},
										key: null,
									},
									{
										type: "div",
										props: {
											style: {
												fontSize: "34px",
												lineHeight: 1.1,
												opacity: 0.85,
											},
											children: description,
										},
										key: null,
									},
								],
							},
							key: null,
						},
					],
				},
				key: null,
			},
			{
				width: OG_WIDTH,
				height: OG_HEIGHT,
				headers: {
					"Cache-Control": import.meta.env.DEV
						? "no-store"
						: "public, max-age=86400",
				},
			},
		);
	} catch {
		return fallbackResponse(title, description);
	}

	if (cache && cacheKey) {
		try {
			await cache.put(cacheKey, response.clone());
		} catch {
			// Ignore cache write errors and still serve the rendered response.
		}
	}

	return response;
}
