-- Mise Kitchen — Round B migration
-- Adds a leftovers table to track "I made 4 servings, ate 2, 2 left for tomorrow's lunch"

create table if not exists leftovers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  servings_left integer not null check (servings_left >= 0),
  cooked_on date default current_date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table leftovers enable row level security;

create policy "members read leftovers" on leftovers
  for select using (is_household_member(household_id));
create policy "members manage leftovers" on leftovers
  for all using (is_household_member(household_id));

-- Realtime
alter publication supabase_realtime add table leftovers;

-- Helpful index for querying current leftovers
create index if not exists leftovers_household_idx on leftovers(household_id, servings_left);
