-- Mise Kitchen — Recipe migration script
-- Run this in your Supabase SQL Editor to wipe the old recipes from your household.
-- After running this, refresh the app and click "Reseed recipes" in Settings (or sign out + sign in)
-- to load the new versions.
--
-- This is safe: it only deletes the OLD recipes. Your week plan, pantry, and household stay intact.
-- (Week plan rows that referenced deleted recipes will be cleaned up by ON DELETE CASCADE.)

-- Find your household ID (you can verify it's right):
select id, name from households;

-- Delete all your current recipes (you'll get them back, fresher, in a moment):
delete from recipes
where household_id in (select id from households);

-- After running this:
-- 1. Refresh your Mise app (cmd+shift+R hard reload)
-- 2. Sign out, then sign in fresh
-- 3. The new recipes will auto-seed
--
-- Done!
