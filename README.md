# clap

A standalone **film picker**: pick a random film from
[TMDB](https://www.themoviedb.org/) based on filters (genres, rating, release
years, max runtime, country of origin).

It is a self-contained migration of the `film-picker` page that previously lived
across two repos (`visten-app` front-end + `visten-api` Rust back-end). There is
**no more Rust backend**: the TMDB proxy is reimplemented as Next.js Route
Handlers, and everything deploys as a single app to **Cloudflare Workers** via
the [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adapter.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- MUI v7 (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, Emotion)
- Cloudflare Workers + `@opennextjs/cloudflare` (Node runtime, `nodejs_compat`)

## How it works

The browser only ever talks to local API routes — it **never** sees the TMDB
token. The token stays server-side inside the Route Handlers.

| Route                          | TMDB calls                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| `GET /api/film-picker`         | `discover/movie` (x2) + `movie/{id}` + `movie/{id}/credits`       |
| `GET /api/film-picker/genres`  | `genre/movie/list`                                                |
| `GET /api/film-picker/countries` | `configuration/countries`                                       |

`GET /api/film-picker` accepts these query params: `with_genres`,
`vote_average`, `release_year_min`, `release_year_max`, `runtime`,
`with_origin_country`. Every TMDB discover query is always seeded with
`vote_count.gte=400`.

### Free tier / no R2

This app uses **no ISR and no `revalidate`**, so it needs no incremental cache
and therefore **no R2 bucket**. It stays on the Cloudflare Workers **free tier**
(100k requests/day, 10 ms CPU, 50 subrequests per invocation — the random-film
flow makes 4 TMDB calls). `genres` and `countries` responses carry a
`Cache-Control` header for edge/browser caching, without any persistent store.

## Prerequisites

- Node.js 20+ (developed on Node 24)
- A TMDB API **Read Access Token** (v4 bearer token), from your
  [TMDB account settings](https://www.themoviedb.org/settings/api)
- A Cloudflare account (for preview/deploy)

## Environment variables & secrets

| Variable         | Description                                               | Secret? |
| ---------------- | --------------------------------------------------------- | ------- |
| `TMDB_TOKEN`     | TMDB v4 bearer token used as `Authorization: Bearer …`    | **Yes** |
| `TMDB_API_URL`   | TMDB base URL, **must end with a trailing slash**         | No      |
| `TMDB_IMAGE_URL` | Base URL used to prefix `poster_path`                     | No      |

Typical values:

```
TMDB_API_URL=https://api.themoviedb.org/3/
TMDB_IMAGE_URL=https://image.tmdb.org/t/p/w500
```

### Local

Copy the example file and fill in your token:

```bash
cp .dev.vars.example .dev.vars
# then edit .dev.vars and set TMDB_TOKEN=...
```

`.dev.vars` is git-ignored and is read both by `next dev` (via
`initOpenNextCloudflareForDev`) and by `npm run preview`.

### Production (Cloudflare)

Set the token as a **secret** (never commit it):

```bash
npx wrangler secret put TMDB_TOKEN
```

The two non-secret URLs can be set as plain vars via the Cloudflare dashboard
(Workers → your worker → Settings → Variables), or added to `wrangler.jsonc`
under a `"vars"` block if you prefer them in source control.

## Install

```bash
npm install
```

## Develop locally

Standard Next.js dev server (hot reload), reads `.dev.vars`:

```bash
npm run dev
```

App runs at http://localhost:3000.

## Preview on the Workers runtime

Builds with OpenNext and serves the worker locally — closest thing to
production, still reading `.dev.vars`:

```bash
npm run preview
```

## Deploy to Cloudflare Workers

Make sure you are logged in (`npx wrangler login`) and that the `TMDB_TOKEN`
secret is set, then:

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` followed by `opennextjs-cloudflare
deploy`. To upload a new version without promoting it to production, use
`npm run upload`.

## Useful scripts

| Script               | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Next.js dev server                                       |
| `npm run build`      | Next.js production build (type-check + lint)             |
| `npm run preview`    | OpenNext build + local Workers preview                   |
| `npm run deploy`     | OpenNext build + deploy to Cloudflare                    |
| `npm run upload`     | OpenNext build + upload a new (unpromoted) version       |
| `npm run cf-typegen` | Generate `cloudflare-env.d.ts` binding types             |

## Notes

- Keep `TMDB_API_URL` ending with a trailing slash — the routes concatenate
  paths like `discover/movie` directly after it.
- `.open-next/`, `.wrangler/`, `.dev.vars` and `cloudflare-env.d.ts` are
  git-ignored.
