-- Mise Kitchen — Database schema
-- Run this once in your Supabase SQL Editor when setting up a new project.
-- See README.md for full setup instructions.

-- HOUSEHOLDS
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text,
  joined_at timestamptz default now(),
  unique(household_id, user_id)
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  title text not null,
  servings int default 2,
  time_min int default 30,
  description text,
  tags text[] default '{}',
  image text default '🍽️',
  ingredients jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table week_plan (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  day text not null,
  servings int default 2,
  created_at timestamptz default now()
);

create table pantry (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  name text not null,
  qty numeric default 1,
  unit text default 'unit',
  updated_at timestamptz default now()
);

-- RLS
alter table households enable row level security;
alter table household_members enable row level security;
alter table recipes enable row level security;
alter table week_plan enable row level security;
alter table pantry enable row level security;

create or replace function is_household_member(hid uuid)
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

create policy "members can read their households" on households for select using (is_household_member(id));
create policy "any user can create a household" on households for insert with check (true);
create policy "members can update their households" on households for update using (is_household_member(id));

create policy "members can read their household roster" on household_members for select using (is_household_member(household_id) or user_id = auth.uid());
create policy "any user can join a household" on household_members for insert with check (user_id = auth.uid());
create policy "users can leave a household" on household_members for delete using (user_id = auth.uid());

create policy "members read recipes" on recipes for select using (is_household_member(household_id));
create policy "members create recipes" on recipes for insert with check (is_household_member(household_id));
create policy "members update recipes" on recipes for update using (is_household_member(household_id));
create policy "members delete recipes" on recipes for delete using (is_household_member(household_id));

create policy "members read week plan" on week_plan for select using (is_household_member(household_id));
create policy "members manage week plan" on week_plan for all using (is_household_member(household_id));

create policy "members read pantry" on pantry for select using (is_household_member(household_id));
create policy "members manage pantry" on pantry for all using (is_household_member(household_id));

-- Realtime
alter publication supabase_realtime add table recipes;
alter publication supabase_realtime add table week_plan;
alter publication supabase_realtime add table pantry;
