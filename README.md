# Николово / Nikolovo

Website for the village of Nikolovo, Haskovo Province, Bulgaria — <https://www.nikolovo.com>.

Next.js 16 (App Router, TypeScript), deployed on Vercel. Bilingual: Bulgarian at the root,
English under `/en`.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` for local overrides. Nothing is required to run the site —
events and media are read from `content/events.ts` and `public/` by default.

## Layout

| Path | What's in it |
| --- | --- |
| `app/(bg)/` | Bulgarian pages — `/`, `/sabitiya`, `/istoriya`, `/zabelezhitelnosti`, `/kak-da-stignete`, `/galeriya` |
| `app/(en)/en/` | English mirror — `/en`, `/en/events`, `/en/history`, `/en/landmarks`, `/en/getting-here`, `/en/gallery` |
| `app/api/` | Events CRUD and signed media uploads (see `supabase/README.md`) |
| `app/globals.css` | The whole stylesheet, light and dark themes |
| `components/` | Header, footer, event post, lightbox, video player |
| `content/events.ts` | Event content while Supabase is off |
| `lib/routes.ts` | Page paths, nav labels and hreflang pairs for both locales |
| `supabase/` | SQL migrations and the switch-over guide |

Each locale has its own root layout (`<html lang>` differs), so switching language is a full
page load. Add a page by creating it in both groups and adding its key to `lib/routes.ts`.

## Adding an event

Append to `content/events.ts`. Put photos in `public/images/` and clips in `public/videos/`;
videos also need a `.webp` poster and a `.jpg` twin of it for search engines. The events pages,
their JSON-LD and the sitemap all pick it up automatically.

## SEO

Metadata comes from each page's `metadata` export: title, description, keywords, canonical,
hreflang (`bg` / `en` / `x-default`), Open Graph and Twitter cards. JSON-LD is built in
`lib/jsonld.ts`. `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt`,
including image and video entries for the events page.

The old `.html` URLs redirect permanently to the clean ones via `next.config.ts` — keep those
redirects.

## Supabase

Not connected yet. The schema, storage buckets, API routes and a migration script are all in
place; `supabase/README.md` walks through switching over when you want to move events and media
out of the repo.
