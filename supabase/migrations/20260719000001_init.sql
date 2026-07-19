-- Events and their media. Bilingual content lives in paired *_bg / *_en columns
-- because every post is authored in both languages at once.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  event_date date not null,
  published boolean not null default false,
  title_bg text not null,
  title_en text not null,
  description_bg text,
  description_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_event_date_idx on public.events (event_date desc);
create index if not exists events_published_idx on public.events (published);

create table if not exists public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  -- Path inside the `images` / `videos` storage bucket.
  storage_path text not null,
  -- Videos only: webp poster shown before playback, and its jpg twin for schema.org.
  poster_path text,
  thumbnail_path text,
  width integer not null,
  height integer not null,
  -- Images only.
  alt_bg text,
  alt_en text,
  -- Videos only.
  title_bg text,
  title_en text,
  description_bg text,
  description_en text,
  duration_seconds integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint event_media_image_has_alt
    check (kind <> 'image' or (alt_bg is not null and alt_en is not null)),
  constraint event_media_video_has_poster
    check (kind <> 'video' or (poster_path is not null and duration_seconds is not null))
);

create index if not exists event_media_event_id_idx on public.event_media (event_id, sort_order);

alter table public.events enable row level security;
alter table public.event_media enable row level security;

-- Public reads are limited to published events. There are deliberately no insert/update/delete
-- policies: all writes go through the API routes using the service role, which bypasses RLS.
drop policy if exists "Published events are readable" on public.events;
create policy "Published events are readable"
  on public.events for select
  using (published = true);

drop policy if exists "Media of published events is readable" on public.event_media;
create policy "Media of published events is readable"
  on public.event_media for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_media.event_id and e.published = true
    )
  );
