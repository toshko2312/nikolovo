-- Cards on the "Забележителности" / "Landmarks" page, editable from the admin UI.

create table if not exists public.landmark_cards (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  title_bg text not null,
  title_en text not null,
  text_bg text,
  text_en text,
  -- Path inside the `images` bucket; null renders the striped placeholder.
  image_path text,
  image_width integer,
  image_height integer,
  image_alt_bg text,
  image_alt_en text,
  -- Small label shown on top of the placeholder. Seeded for the original cards and
  -- left null for anything added later, which simply shows a bare placeholder.
  chip_bg text,
  chip_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists landmark_cards_sort_order_idx on public.landmark_cards (sort_order);

alter table public.landmark_cards enable row level security;

-- Public reads; every write goes through the server actions using the service role.
drop policy if exists "Landmark cards are readable" on public.landmark_cards;
create policy "Landmark cards are readable"
  on public.landmark_cards for select
  using (true);

insert into public.landmark_cards
  (sort_order, title_bg, title_en, text_bg, text_en,
   image_path, image_width, image_height, image_alt_bg, image_alt_en, chip_bg, chip_en)
values
  (0, 'Православният храм', 'The Orthodox church',
   'Църквата на селото — сърцето на местния духовен живот.',
   'The village church — the heart of local spiritual life.',
   null, null, null, null, null, 'снимка · храм', 'photo · church'),

  (1, 'Музеят на селото', 'The village museum',
   'Пази живия спомен за миналите времена и бита на хората.',
   'Keeps the living memory of times past and the everyday life of the people.',
   null, null, null, null, null, 'снимка · музей', 'photo · museum'),

  (2, 'Язовир Тракиец', 'Trakiets Reservoir',
   'Водоемът край селото, дълго снабдявал Хасково с вода.',
   'The body of water near the village that long supplied Haskovo with water.',
   'yazovir-trakiec.jpg', 675, 348,
   'Язовир Тракиец край село Николово — въздушен изглед',
   'Aerial view of the Trakiets Reservoir near Nikolovo, Haskovo Province',
   null, null),

  (3, 'Селският площад', 'The village square',
   'Центърът на живота в Николово и място за срещи.',
   'The centre of life in Nikolovo and a place to meet.',
   null, null, null, null, null, 'снимка · площад', 'photo · square'),

  (4, 'Старите къщи', 'The old houses',
   'Традиционна архитектура, която пази духа на селото.',
   'Traditional architecture that keeps the spirit of the village.',
   null, null, null, null, null, 'снимка · къщи', 'photo · houses'),

  (5, 'Околностите', 'The surroundings',
   'Зелени хълмове и пътеки за разходка край селото.',
   'Green hills and walking trails around the village.',
   null, null, null, null, null, 'снимка · околности', 'photo · surroundings');
