# Supabase setup

Nothing here is live yet. The site reads events from `content/events.ts` and serves media from
`public/` until `USE_SUPABASE=true`. These files are what you run when you decide to switch.

## 1. Apply the schema

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This creates `public.events`, `public.event_media`, the `images` and `videos` storage buckets,
and the row-level security policies (public read of published rows only; every write goes
through the API routes with the service role).

## 2. Fill in the environment

Copy `.env.example` to `.env.local` and set:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key (server only) |
| `ADMIN_API_TOKEN` | Any long random string, e.g. `openssl rand -hex 32` |

Leave `USE_SUPABASE=false` for now.

## 3. Migrate the existing content

```bash
npm run migrate:supabase
```

The script uploads every file referenced by `content/events.ts` from `public/images` and
`public/videos` into the matching bucket, then upserts the event rows and replaces their media
rows. It is idempotent — running it twice changes nothing.

## 4. Switch over

Set `USE_SUPABASE=true` locally and in the Vercel project, then redeploy. Media URLs move from
`/images/...` to the bucket's public URL; `lib/media.ts` handles both and `next.config.ts`
already allows `*.supabase.co` in `images.remotePatterns`.

Once the switch is verified in production, the video files can be dropped from git. If you do
that, add redirects from `/videos/*` to the storage URLs so existing video SEO keeps resolving.

## API

| Endpoint | Method | Auth |
| --- | --- | --- |
| `/api/events` | `GET` | none (published only); `?all=1` needs the bearer token |
| `/api/events` | `POST` | `Authorization: Bearer $ADMIN_API_TOKEN` |
| `/api/events/[id]` | `GET` | none for published, bearer for drafts |
| `/api/events/[id]` | `PATCH`, `DELETE` | bearer |
| `/api/upload` | `POST` | bearer — returns a signed upload URL |

Uploads use a signed URL rather than posting bytes to the API because Vercel caps request
bodies at 4.5 MB and the event videos are larger. Ask for a URL, then `PUT` the file to it:

```bash
curl -X POST https://www.nikolovo.com/api/upload \
  -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"bucket":"videos","path":"my-clip.mp4"}'
```
