import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import sourceImage from "../../assets/blog-placeholder-4.jpg";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export const prerender = false;

const toAbsoluteAssetUrl = (assetPath, requestUrl) =>
	new URL(assetPath, requestUrl).toString();

export function GET({ url }) {
	const title = url.searchParams.get("title") ?? "Astro 6 runtime repro";
	const subtitle =
		url.searchParams.get("subtitle") ??
		"Vite separate environments: source files inaccessible";

	return new ImageResponse(
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
										children: subtitle,
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
				"Cache-Control": "no-store",
			},
		},
	);
}
