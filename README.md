# Astro 6 + Cloudflare Workers: WASM Runtime Resolution Bug

Minimal reproduction for a WASM module resolution error when using `@cloudflare/pages-plugin-vercel-og` (vercel/og) with Astro 6 on Cloudflare Workers.

## The Problem

When deploying an Astro 6 site with `@cloudflare/pages-plugin-vercel-og` to Cloudflare Workers, the OG image endpoint fails at runtime with:

```
Error: No such module "_astro/resvg.kUBXx0UJ.wasm".
  imported from "chunks/index_BRU_o9H1.mjs"
```

The `resvg.wasm` file exists in the build output but the Cloudflare Workers runtime cannot resolve it as a module import.

## Root Cause

The issue is a **version incompatibility between `astro`, `@astrojs/cloudflare`, and how Wrangler bundles WASM modules**.

### Build output directory matters

- `@astrojs/cloudflare@13.0.0-beta.7` (older): outputs to `dist/_worker.js/` (legacy Pages-style). Wrangler does not automatically attach WASM files from this directory as Worker modules, causing the runtime `No such module` error.
- `@astrojs/cloudflare@13.0.0-beta.8` (newer): outputs to `dist/server/` with a generated `wrangler.json` that sets `"no_bundle": true`. Wrangler reads this config, discovers the WASM files, and correctly attaches them as `compiled-wasm` modules.

### Version compatibility matrix

| `astro` | `@astrojs/cloudflare` | Build | WASM at runtime |
|---|---|---|---|
| `6.0.0-beta.6` | `13.0.0-beta.3` | OK | **BROKEN** - WASM not bundled as modules |
| `6.0.0-beta.6` | `13.0.0-beta.7` | **FAILS** - missing `astro/app/manifest` export | N/A |
| `6.0.0-beta.6` | `13.0.0-beta.8` | **FAILS** - missing `astro/app/manifest` export | N/A |
| `6.0.0-beta.11` | `13.0.0-beta.7` | OK | **BROKEN** - WASM not bundled as modules |
| `6.0.0-beta.11` | `13.0.0-beta.8` | OK | **OK** - WASM correctly attached |

### Key findings

1. **`@astrojs/cloudflare@beta.8` changed the output structure** from `dist/_worker.js/` to `dist/server/`, generating a `wrangler.json` that tells Wrangler to attach WASM as additional modules.
2. **`@astrojs/cloudflare@beta.8` requires `astro@beta.7+`** because it imports `astro/app/manifest`, which older astro versions don't export.
3. **The working combination is `astro@6.0.0-beta.11` + `@astrojs/cloudflare@13.0.0-beta.8`**, which both builds successfully and correctly bundles WASM modules for the Workers runtime.

## How to Reproduce the WASM Error

Use the older adapter that outputs to `_worker.js/`:

```json
{
  "astro": "6.0.0-beta.11",
  "@astrojs/cloudflare": "13.0.0-beta.7"
}
```

Build and deploy. The `/og-image` endpoint will fail with the `No such module` error because Wrangler doesn't attach the WASM files from the `_worker.js/` output as Worker modules.

## Fix

Use compatible versions:

```json
{
  "astro": "6.0.0-beta.11",
  "@astrojs/cloudflare": "13.0.0-beta.8"
}
```

## Project Structure

```
src/
  pages/
    og-image/index.js   # OG image endpoint using @cloudflare/pages-plugin-vercel-og
    blog/[...slug].astro
  content/
    blog/
astro.config.mjs
wrangler.jsonc
```

## Commands

| Command | Action |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start local dev server |
| `pnpm build` | Build production site |

## Related

- [`@cloudflare/pages-plugin-vercel-og`](https://www.npmjs.com/package/@cloudflare/pages-plugin-vercel-og) - Cloudflare's fork of vercel/og using resvg WASM
- [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) - Astro adapter for Cloudflare Workers
