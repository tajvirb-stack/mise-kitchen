-- Mise Kitchen — Round D migration: foolproofing
-- Adds: pantry expirations, recipe versioning, cooking history

-- Add expiration columns to pantry table
alter table pantry
  add column if not exists expires_on date,
  add column if not exists is_perishable boolean default false;

-- Recipe versioning — store the original version separately so a user can revert
alter table recipes
  add column if not exists original_recipe jsonb,
  add column if not exists version integer default 1,
  add column if not exists last_cooked_on date;

-- Cooking history table — every time you cook a recipe, log it (powers streaks/stats)
create table if not exists cooking_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  cooked_on date default current_date,
  servings_made integer default 2,
  rating smallint check (rating >= 1 and rating <= 5),
  notes text,
  cooked_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table cooking_log enable row level security;

create policy "members read cooking log" on cooking_log
  for select using (is_household_member(household_id));
create policy "members manage cooking log" on cooking_log
  for all using (is_household_member(household_id));

alter publication supabase_realtime add table cooking_log;

create index if not exists cooking_log_household_idx on cooking_log(household_id, cooked_on desc);
create index if not exists cooking_log_recipe_idx on cooking_log(recipe_id, cooked_on desc);
