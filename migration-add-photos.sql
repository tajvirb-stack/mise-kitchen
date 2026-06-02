-- Mise Kitchen — Round C migration: photo storage
-- Creates a Supabase Storage bucket for cooked-recipe photos.

-- Create the bucket (you can also do this in Supabase Dashboard → Storage → New bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-photos',
  'recipe-photos',
  true, -- public read so we can use the public URL
  5242880, -- 5 MB max
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage policies — anyone can read, only authenticated household members can write
create policy "members upload recipe photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-photos');

create policy "anyone can read recipe photos"
  on storage.objects for select
  using (bucket_id = 'recipe-photos');

create policy "members delete own recipe photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Photos table — links a photo URL to a recipe + leftover (optionally)
create table if not exists recipe_photos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  storage_path text not null, -- the path in the recipe-photos bucket
  public_url text not null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table recipe_photos enable row level security;

create policy "members read photos" on recipe_photos
  for select using (is_household_member(household_id));
create policy "members manage photos" on recipe_photos
  for all using (is_household_member(household_id));

alter publication supabase_realtime add table recipe_photos;

create index if not exists recipe_photos_household_idx on recipe_photos(household_id, created_at desc);
create index if not exists recipe_photos_recipe_idx on recipe_photos(recipe_id, created_at desc);
