-- Photos on the "Галерия" / "Gallery" page, editable from the admin UI. Replaces the
-- placeholder tiles the page used to hardcode.

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  -- Unlike landmark_cards, a gallery row without a photo makes no sense.
  image_path text not null,
  image_width integer not null,
  image_height integer not null,
  -- One label per language, shown as the chip over the photo and used as its alt text.
  caption_bg text not null,
  caption_en text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_photos_sort_order_idx on public.gallery_photos (sort_order);

alter table public.gallery_photos enable row level security;

-- Public reads; every write goes through the server actions using the service role.
drop policy if exists "Gallery photos are readable" on public.gallery_photos;
create policy "Gallery photos are readable"
  on public.gallery_photos for select
  using (true);

-- The one real photo the page already showed. The same bucket object backs a landmark
-- card, which is why lib/admin/gallery.ts never deletes bucket-root paths.
insert into public.gallery_photos
  (sort_order, image_path, image_width, image_height, caption_bg, caption_en)
values
  (0, 'yazovir-trakiec.jpg', 675, 348, 'язовир Тракиец', 'Trakiets Reservoir');
