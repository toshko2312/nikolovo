-- Short news items shown on the "Новини" / "News" page: title, description and one
-- optional link. The link is rendered as an embed (YouTube, Vimeo, Spotify, …) or a
-- plain anchor, decided at render time by lib/embed.ts — nothing about the provider
-- is stored here, so re-classifying a URL never needs a data migration.

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  published_at date not null,
  published boolean not null default true,
  title_bg text not null,
  title_en text not null,
  description_bg text,
  description_en text,
  -- Absolute http(s) URL, or null for a post with no link.
  link_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_published_at_idx on public.news (published_at desc);
create index if not exists news_published_idx on public.news (published);

alter table public.news enable row level security;

-- Public reads; every write goes through the server actions using the service role.
drop policy if exists "News is readable" on public.news;
create policy "News is readable"
  on public.news for select
  using (published = true);

-- The home-post link dropdown is driven by PAGE_ORDER, which now includes 'news'.
alter table public.home_posts drop constraint if exists home_posts_link_page_check;
alter table public.home_posts add constraint home_posts_link_page_check
  check (link_page in ('events', 'news', 'history', 'landmarks', 'gettingHere', 'gallery'));
