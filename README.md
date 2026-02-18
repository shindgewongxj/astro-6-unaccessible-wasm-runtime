# Astro Starter Kit: Blog

```sh
pnpm create astro@latest -- --template blog
```

Features:

- Minimal styling
- SEO-friendly with canonical/OpenGraph metadata
- Sitemap support
- RSS feed support
- Markdown + MDX support
- Dynamic `/og-image?title=&description=` endpoint from `src/pages/og-image/index.js`

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the project root:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`      |
| `pnpm build`              | Builds the production site to `./dist/`          |
| `pnpm preview`            | Preview the Astro build locally                  |
| `pnpm preview:worker`     | Builds + runs the Cloudflare Worker locally      |
| `pnpm deploy`             | Builds + deploys with Wrangler                   |
| `pnpm astro ...`          | Run Astro CLI commands                           |

## Cloudflare Workers deployment

This project is configured for Cloudflare Workers via the Astro adapter (`@astrojs/cloudflare`):

- `astro.config.mjs` uses `output: "server"` with `adapter: cloudflare()`.
- `wrangler.toml` provides Worker metadata (name and compatibility date) used by local/dev tooling.
- `src/pages/og-image/index.js` provides the `/og-image` endpoint used by metadata in `src/components/BaseHead.astro`.

Deploy flow:

1. Build Astro with the adapter: `pnpm build`
2. Deploy the generated Worker + assets: `pnpm deploy`

## OG image endpoint

`/og-image` supports both optional query params:

- `/og-image?title=My+Title`
- `/og-image?description=My+Description`
- `/og-image?title=My+Title&description=My+Description`

When either query param is missing, defaults are used.

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
