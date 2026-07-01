-- Mise Kitchen — Round E migration: schema sync
-- ============================================================================
-- Captures schema that previously existed ONLY in the live database (applied
-- by hand and never committed), so a fresh Supabase project built from version
-- control is complete. Without this, create-household, weekly meal slots, and
-- the entire nutrition / goal-tracking subsystem silently break on a new DB.
--
-- Every statement is IDEMPOTENT and ADDITIVE — safe to run on the existing
-- production database (objects that already exist are left untouched).
-- Run once in the Supabase SQL Editor.
-- ============================================================================

-- 1. RPC used by createHousehold() — creates the household and adds the current
--    user as its first member in one privileged (security-definer) transaction,
--    bypassing the chicken-and-egg RLS problem. Mirrors join_household_by_invite.
create or replace function create_household_with_member(p_name text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into households (name)
  values (p_name)
  returning id into v_household_id;

  insert into household_members (household_id, user_id, display_name)
  values (v_household_id, v_user_id, p_display_name);

  return v_household_id;
end;
$$;

grant execute on function create_household_with_member(text, text) to authenticated;

-- 2. week_plan.meal_slot — which meal (breakfast/lunch/dinner) a plan row is for.
alter table week_plan
  add column if not exists meal_slot text default 'dinner';

-- 3. recipes metadata columns — read on load (state.js) and written on reseed
--    (Kitchen.jsx). The seed carries these fields; without the columns they are
--    dropped, leaving day protein/calorie totals at 0 and meal-type planning dead.
alter table recipes
  add column if not exists nutrition jsonb default '{}'::jsonb,
  add column if not exists meal_type text default 'dinner',
  add column if not exists leftover_friendly boolean default false,
  add column if not exists costco_sourcing text[] default '{}',
  add column if not exists no_tomato_note text,
  add column if not exists no_cilantro_note text;

-- 4. user_nutrition_targets — per-user macro goals (upserted on user_id).
create table if not exists user_nutrition_targets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories_target integer default 2300,
  protein_target integer default 190,
  fiber_target integer default 50,
  sodium_max integer default 2300,
  updated_at timestamptz default now()
);

alter table user_nutrition_targets enable row level security;

do $$ begin
  create policy "users manage own targets" on user_nutrition_targets
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- 5. food_log — per-user daily food entries (recipe-sourced or quick-add).
create table if not exists food_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null default current_date,
  meal_slot text,
  source_type text not null default 'quick_add',  -- 'recipe' | 'quick_add'
  recipe_id uuid references recipes(id) on delete set null,
  custom_name text,
  emoji text,
  servings numeric default 1,
  calories numeric,
  protein numeric,
  fat numeric,
  carbs numeric,
  fiber numeric,
  sodium numeric,
  logged_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table food_log enable row level security;

do $$ begin
  create policy "users manage own food log" on food_log
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create index if not exists food_log_user_date_idx on food_log(user_id, log_date);

-- 6. quick_add_foods — per-user saved quick-add items (ordered by protein).
create table if not exists quick_add_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text,
  calories numeric,
  protein numeric,
  fat numeric,
  carbs numeric,
  fiber numeric,
  sodium numeric,
  created_at timestamptz default now()
);

alter table quick_add_foods enable row level security;

do $$ begin
  create policy "users manage own quick adds" on quick_add_foods
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create index if not exists quick_add_foods_user_idx on quick_add_foods(user_id, protein desc);

-- 7. Realtime — the app subscribes to food_log and user_nutrition_targets.
do $$ begin
  alter publication supabase_realtime add table food_log;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table user_nutrition_targets;
exception when duplicate_object then null; end $$;
