-- Public buckets for the site's media. Files keep the same names they have in /public,
-- so the migration script is a straight upload with no renaming.

insert into storage.buckets (id, name, public)
values ('images', 'images', true), ('videos', 'videos', true)
on conflict (id) do update set public = true;

-- Anyone may read; writes are service-role only (the service role bypasses RLS,
-- so no insert/update/delete policy is defined).
drop policy if exists "Public read of site media" on storage.objects;
create policy "Public read of site media"
  on storage.objects for select
  using (bucket_id in ('images', 'videos'));
