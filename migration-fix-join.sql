-- Mise Kitchen — fix for "Invite code not found" error
-- The original join flow tried to SELECT the household by invite code, but RLS
-- blocked non-members from reading it, making valid codes appear invalid.
-- This security-definer RPC looks up + inserts in one privileged transaction.

create or replace function join_household_by_invite(p_invite_code text, p_display_name text)
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

  -- Look up household by invite code (bypasses RLS since we're security definer)
  select id into v_household_id
  from households
  where lower(invite_code) = lower(trim(p_invite_code));

  if v_household_id is null then
    raise exception 'invite code not found';
  end if;

  -- Check if already a member
  if exists (
    select 1 from household_members
    where household_id = v_household_id and user_id = v_user_id
  ) then
    raise exception 'already a member of this household';
  end if;

  -- Insert membership
  insert into household_members (household_id, user_id, display_name)
  values (v_household_id, v_user_id, p_display_name);

  return v_household_id;
end;
$$;

grant execute on function join_household_by_invite(text, text) to authenticated;
