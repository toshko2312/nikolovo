-- Home-page sections ("История", "Природа", ...), editable from the admin UI.
-- Hero and CTA stay hardcoded in the page — only the middle split-sections move here.

create table if not exists public.home_posts (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  eyebrow_bg text not null,
  eyebrow_en text not null,
  title_bg text not null,
  title_en text not null,
  body_bg text,
  body_en text,
  -- Path inside the `images` bucket; null renders a placeholder block.
  image_path text,
  image_width integer,
  image_height integer,
  image_alt_bg text,
  image_alt_en text,
  -- Optional "read more" link to one of the site's other pages.
  link_page text check (link_page in ('events', 'history', 'landmarks', 'gettingHere', 'gallery')),
  link_text_bg text,
  link_text_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_posts_sort_order_idx on public.home_posts (sort_order);

alter table public.home_posts enable row level security;

-- Public reads; all writes go through the API/server actions using the service role.
drop policy if exists "Home posts are readable" on public.home_posts;
create policy "Home posts are readable"
  on public.home_posts for select
  using (true);

insert into public.home_posts
  (sort_order, eyebrow_bg, eyebrow_en, title_bg, title_en, body_bg, body_en,
   image_path, image_width, image_height, image_alt_bg, image_alt_en,
   link_page, link_text_bg, link_text_en)
values
  (0, 'История', 'History', 'От Ески кьой до Николово', 'From Eski Köy to Nikolovo',
   'До 1906 г. селото носи името Ески кьой, по-късно Старо село, а през 1950 г. е преименувано на Николово. В него живеят само православни християни.',
   'Until 1906 the village was named Eski Köy, later Staro Selo (“Old Village”), and in 1950 it was renamed Nikolovo. Its residents are all Orthodox Christians.',
   null, null, null, null, null,
   'history', 'Прочети историята →', 'Read the history →'),

  (1, 'Природа', 'Nature', 'Водите на Тракиец', 'The waters of Trakiets',
   'В землището на селото е разположен язовир Тракиец, който дълги години снабдява град Хасково с питейна вода.',
   'The Trakiets Reservoir lies within the village lands and for many years supplied the town of Haskovo with drinking water.',
   'yazovir-trakiec.jpg', 675, 348,
   'Язовир Тракиец край село Николово, област Хасково — въздушен изглед',
   'Aerial view of the Trakiets Reservoir near the village of Nikolovo, Haskovo Province',
   null, null, null),

  (2, 'Предание', 'Legend', 'Легендата за „Света Богородица“', 'The legend of “Sveta Bogoroditsa”',
   'Според местно предание най-голямата църква в Хасково — „Света Богородица“ — е построена по проекта на църквата в Николово.',
   'According to local lore, the largest church in Haskovo — “Sveta Bogoroditsa” (Holy Mother of God) — was built to the design of the church in Nikolovo.',
   null, null, null, null, null,
   null, null, null),

  (3, 'Памет', 'Memory', 'Музеят на селото', 'The village museum',
   'В Николово има музей, който пази живия спомен за миналите времена и разказва историята на хората от селото.',
   'Nikolovo has a museum that keeps the living memory of times past and tells the story of the village’s people.',
   null, null, null, null, null,
   'landmarks', 'Виж забележителностите →', 'See the landmarks →'),

  (4, 'Традиция', 'Tradition', 'Съборът в края на август', 'The fair in late August',
   'Всяка година в последната събота на август (около 28 август) селото се събира на традиционния събор.',
   'Every year on the last Saturday of August (around 28 August) the village gathers for its traditional fair.',
   null, null, null, null, null,
   null, null, null);
