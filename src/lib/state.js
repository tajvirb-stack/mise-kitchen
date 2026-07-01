import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { SEED_RECIPES } from './seed-recipes';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut()
  };
}

export function useHousehold(user) {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHousehold = useCallback(async () => {
    if (!user) {
      setHousehold(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data: memberRows, error: memErr } = await supabase
      .from('household_members')
      .select('household_id, display_name')
      .eq('user_id', user.id)
      .limit(1);

    if (memErr) { setError(memErr.message); setLoading(false); return; }

    if (!memberRows || memberRows.length === 0) {
      setHousehold(null);
      setLoading(false);
      return;
    }

    const hid = memberRows[0].household_id;
    const { data: hh, error: hhErr } = await supabase
      .from('households')
      .select('id, name, invite_code')
      .eq('id', hid)
      .single();

    if (hhErr) { setError(hhErr.message); setLoading(false); return; }

    const { data: ms } = await supabase
      .from('household_members')
      .select('user_id, display_name, joined_at')
      .eq('household_id', hid);

    setHousehold(hh);
    setMembers(ms || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadHousehold(); }, [loadHousehold]);

  const createHousehold = async (name, displayName) => {
    setError(null);
    // Use the SQL function we created earlier (bypasses the buggy RLS)
    const { data: hhId, error: e1 } = await supabase.rpc('create_household_with_member', {
      p_name: name,
      p_display_name: displayName
    });
    if (e1) { setError(e1.message); return null; }

    // Seed a new household with the full recipe library.
    // NOTE: keep these fields in sync with the reseed insert in Kitchen.jsx —
    // dropping the metadata columns here leaves new households with null
    // nutrition (goal totals read 0) and null meal_type (smart-week planning dead).
    const seed = SEED_RECIPES.map(r => ({
      household_id: hhId,
      title: r.title,
      servings: r.servings,
      time_min: r.timeMin,
      description: r.description,
      tags: r.tags,
      image: r.image,
      ingredients: r.ingredients,
      steps: r.steps,
      created_by: user.id,
      meal_type: r.mealType || 'dinner',
      leftover_friendly: r.leftoverFriendly || false,
      nutrition: r.nutrition || {},
      costco_sourcing: r.costcoSourcing || [],
      no_tomato_note: r.noTomatoNote || null,
      no_cilantro_note: r.noCilantroNote || null
    }));
    // Insert in chunks to avoid payload limits (43+ full recipe objects).
    for (let i = 0; i < seed.length; i += 10) {
      await supabase.from('recipes').insert(seed.slice(i, i + 10));
    }

    await loadHousehold();
    return { id: hhId };
  };

  const joinHousehold = async (inviteCode, displayName) => {
    setError(null);
    const code = inviteCode.trim().toLowerCase();

    const { data: householdId, error: e1 } = await supabase
      .rpc('join_household_by_invite', {
        p_invite_code: code,
        p_display_name: displayName
      });

    if (e1) {
      const msg = (e1.message || '').toLowerCase();
      if (msg.includes('invite code not found')) {
        setError('Invite code not found. Double-check the spelling.');
      } else if (msg.includes('already a member')) {
        setError('You are already a member of this household.');
      } else if (msg.includes('function') && msg.includes('does not exist')) {
        setError('Setup incomplete — the join function is missing in the database. Tell the household owner to run the join_household_by_invite migration.');
      } else {
        setError(e1.message || 'Could not join household.');
      }
      return null;
    }

    await loadHousehold();
    return { id: householdId };
  };

  const updateHouseholdName = async (newName) => {
    if (!household || !newName.trim()) return;
    const { error } = await supabase
      .from('households')
      .update({ name: newName.trim() })
      .eq('id', household.id);
    if (!error) await loadHousehold();
    return !error;
  };

  return { household, members, loading, error, createHousehold, joinHousehold, reload: loadHousehold, updateHouseholdName };
}

// Apply a realtime patch to a list of rows (no full refetch)
function applyRealtimePatch(prev, payload, suppressedIds) {
  const { eventType, new: newRow, old: oldRow } = payload;
  const targetId = newRow?.id ?? oldRow?.id;

  if (eventType === 'INSERT') {
    if (suppressedIds.has(targetId)) return prev;
    if (prev.find(x => x.id === targetId)) return prev;
    return [...prev, newRow];
  }
  if (eventType === 'UPDATE') {
    return prev.map(x => x.id === targetId ? { ...x, ...newRow } : x);
  }
  if (eventType === 'DELETE') {
    return prev.filter(x => x.id !== targetId);
  }
  return prev;
}

export function useHouseholdData(household) {
  const [recipes, setRecipes] = useState([]);
  const [weekPlan, setWeekPlan] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [leftovers, setLeftovers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [cookingLog, setCookingLog] = useState([]);
  const [lastDeleteAt, setLastDeleteAt] = useState(0);
  const [loading, setLoading] = useState(true);

  // Track row IDs we've optimistically deleted so realtime won't resurrect them
  const suppressedDeletesRef = useRef(new Set());
  // Track the last delete for undo support
  const lastDeleteRef = useRef(null);

  const loadAll = useCallback(async () => {
    if (!household) return;
    setLoading(true);
    // Recipes/week_plan/pantry are required tables — must succeed
    const [r, w, p] = await Promise.all([
      supabase.from('recipes').select('*').eq('household_id', household.id),
      supabase.from('week_plan').select('*').eq('household_id', household.id),
      supabase.from('pantry').select('*').eq('household_id', household.id)
    ]);
    const sup = suppressedDeletesRef.current;
    setRecipes((r.data || []).filter(x => !sup.has(x.id)));
    setWeekPlan((w.data || []).filter(x => !sup.has(x.id)));
    setPantry((p.data || []).filter(x => !sup.has(x.id)));

    // Leftovers and photos are optional — gracefully degrade if migrations haven't been run
    try {
      const l = await supabase.from('leftovers').select('*').eq('household_id', household.id).gt('servings_left', 0);
      if (!l.error) setLeftovers((l.data || []).filter(x => !sup.has(x.id)));
    } catch (_) { /* leftovers table doesn't exist yet — ignore */ }
    try {
      const ph = await supabase.from('recipe_photos').select('*').eq('household_id', household.id).order('created_at', { ascending: false });
      if (!ph.error) setPhotos((ph.data || []).filter(x => !sup.has(x.id)));
    } catch (_) { /* recipe_photos table doesn't exist yet — ignore */ }
    try {
      const cl = await supabase.from('cooking_log').select('*').eq('household_id', household.id).order('cooked_on', { ascending: false }).limit(200);
      if (!cl.error) setCookingLog((cl.data || []).filter(x => !sup.has(x.id)));
    } catch (_) { /* cooking_log table doesn't exist yet — ignore */ }

    setLoading(false);
  }, [household]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Realtime — surgical per-row updates, NOT a full refetch
  useEffect(() => {
    if (!household) return;
    const sup = suppressedDeletesRef.current;
    const ch = supabase.channel(`household:${household.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recipes', filter: `household_id=eq.${household.id}` },
        (payload) => setRecipes(prev => applyRealtimePatch(prev, payload, sup)))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'week_plan', filter: `household_id=eq.${household.id}` },
        (payload) => setWeekPlan(prev => applyRealtimePatch(prev, payload, sup)))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pantry', filter: `household_id=eq.${household.id}` },
        (payload) => setPantry(prev => applyRealtimePatch(prev, payload, sup)))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'leftovers', filter: `household_id=eq.${household.id}` },
        (payload) => setLeftovers(prev => {
          const updated = applyRealtimePatch(prev, payload, sup);
          // Filter out zero-servings rows
          return updated.filter(l => l.servings_left > 0);
        }))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recipe_photos', filter: `household_id=eq.${household.id}` },
        (payload) => setPhotos(prev => applyRealtimePatch(prev, payload, sup)))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cooking_log', filter: `household_id=eq.${household.id}` },
        (payload) => setCookingLog(prev => applyRealtimePatch(prev, payload, sup)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [household]);

  // ---- Recipe ops
  const addRecipe = async (r) => {
    const { data, error } = await supabase.from('recipes').insert({
      household_id: household.id,
      title: r.title,
      servings: r.servings,
      time_min: r.timeMin || r.time_min,
      description: r.description,
      tags: r.tags || [],
      image: r.image || '🍽️',
      ingredients: r.ingredients || [],
      steps: r.steps || []
    }).select().single();
    if (error) console.error(error);
    return data;
  };
  const updateRecipe = async (id, patch) => {
    const dbPatch = { ...patch };
    if ('timeMin' in dbPatch) { dbPatch.time_min = dbPatch.timeMin; delete dbPatch.timeMin; }
    dbPatch.updated_at = new Date().toISOString();
    // Optimistic update
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...dbPatch } : r));
    // Persist to DB
    const { error } = await supabase.from('recipes').update(dbPatch).eq('id', id);
    if (error) {
      console.error('updateRecipe error:', error);
      // Revert optimistic update on failure
      setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...Object.fromEntries(Object.keys(dbPatch).map(k => [k, undefined])) } : r));
      throw new Error('Failed to save: ' + error.message);
    }
  };
  const deleteRecipe = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      lastDeleteRef.current = { kind: 'recipe', row: recipe, at: Date.now() };
      setLastDeleteAt(Date.now());
    }
    suppressedDeletesRef.current.add(id);
    setRecipes(prev => prev.filter(r => r.id !== id));
    await supabase.from('recipes').delete().eq('id', id);
    setTimeout(() => suppressedDeletesRef.current.delete(id), 5000);
  };

  // ---- Week plan ops — fully optimistic
  const addToWeek = async (recipeId, day = 'Mon', mealSlot = 'dinner') => {
    const r = recipes.find(x => x.id === recipeId);
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    setWeekPlan(prev => [...prev, {
      id: tempId, household_id: household.id, recipe_id: recipeId,
      day, meal_slot: mealSlot, servings: r?.servings || 2, _temp: true
    }]);
    const { data, error } = await supabase.from('week_plan')
      .insert({ household_id: household.id, recipe_id: recipeId, day, meal_slot: mealSlot, servings: r?.servings || 2 })
      .select().single();
    if (error) {
      setWeekPlan(prev => prev.filter(w => w.id !== tempId));
      console.error('addToWeek error:', error);
      return;
    }
    setWeekPlan(prev => prev.map(w => w.id === tempId ? data : w));
  };

  const removeFromWeek = async (id) => {
    const row = weekPlan.find(w => w.id === id);
    if (row) {
      lastDeleteRef.current = { kind: 'week_plan', row, at: Date.now() };
      setLastDeleteAt(Date.now());
    }
    suppressedDeletesRef.current.add(id);
    setWeekPlan(prev => prev.filter(w => w.id !== id));
    if (typeof id === 'string' && id.startsWith('temp_')) return;
    const { error } = await supabase.from('week_plan').delete().eq('id', id);
    if (error) {
      console.error('removeFromWeek error:', error);
      suppressedDeletesRef.current.delete(id);
      await loadAll();
      return;
    }
    setTimeout(() => suppressedDeletesRef.current.delete(id), 5000);
  };

  const updateWeekServings = async (id, servings) => {
    setWeekPlan(prev => prev.map(w => w.id === id ? { ...w, servings } : w));
    if (typeof id === 'string' && id.startsWith('temp_')) return;
    await supabase.from('week_plan').update({ servings }).eq('id', id);
  };

  const updateWeekDay = async (id, day) => {
    setWeekPlan(prev => prev.map(w => w.id === id ? { ...w, day } : w));
    if (typeof id === 'string' && id.startsWith('temp_')) return;
    await supabase.from('week_plan').update({ day }).eq('id', id);
  };

  const updateWeekMealSlot = async (id, mealSlot) => {
    setWeekPlan(prev => prev.map(w => w.id === id ? { ...w, meal_slot: mealSlot } : w));
    if (typeof id === 'string' && id.startsWith('temp_')) return;
    await supabase.from('week_plan').update({ meal_slot: mealSlot }).eq('id', id);
  };

  // ---- Pantry ops — fully optimistic
  const addPantry = async (name, qty, unit, extra = {}) => {
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const row = { household_id: household.id, name, qty: Number(qty) || 1, unit, ...extra };
    setPantry(prev => [...prev, { id: tempId, ...row, _temp: true }]);
    let { data, error } = await supabase.from('pantry').insert(row).select().single();
    if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
      // Migration not run — retry without the new columns
      const fallback = { household_id: household.id, name, qty: Number(qty) || 1, unit };
      const r = await supabase.from('pantry').insert(fallback).select().single();
      data = r.data; error = r.error;
    }
    if (error) {
      setPantry(prev => prev.filter(p => p.id !== tempId));
      console.error('addPantry error:', error);
      return;
    }
    setPantry(prev => prev.map(p => p.id === tempId ? data : p));
  };

  const updatePantry = async (id, patch) => {
    const finalPatch = { ...patch, updated_at: new Date().toISOString() };
    setPantry(prev => prev.map(p => p.id === id ? { ...p, ...finalPatch } : p));
    if (typeof id === 'string' && id.startsWith('temp_')) return;
    const { error } = await supabase.from('pantry').update(finalPatch).eq('id', id);
    if (error) {
      console.error('updatePantry error:', error);
      // If a column is missing (migration not run), strip the patch and retry without those fields
      if (error.message?.includes('column') || error.code === 'PGRST204') {
        const safePatch = { ...finalPatch };
        delete safePatch.expires_on;
        delete safePatch.is_perishable;
        await supabase.from('pantry').update(safePatch).eq('id', id);
      }
    }
  };

  const deletePantry = async (id) => {
    const row = pantry.find(p => p.id === id);
    if (row) {
      lastDeleteRef.current = { kind: 'pantry', row, at: Date.now() };
      setLastDeleteAt(Date.now());
    }
    suppressedDeletesRef.current.add(id);
    setPantry(prev => prev.filter(p => p.id !== id));
    if (!(typeof id === 'string' && id.startsWith('temp_'))) {
      await supabase.from('pantry').delete().eq('id', id);
    }
    setTimeout(() => suppressedDeletesRef.current.delete(id), 5000);
  };

  // ---- Leftover ops
  const addLeftover = async (recipeId, servingsLeft, notes = null) => {
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const optimistic = {
      id: tempId, household_id: household.id, recipe_id: recipeId,
      servings_left: servingsLeft, cooked_on: new Date().toISOString().slice(0, 10),
      notes, _temp: true
    };
    setLeftovers(prev => [...prev, optimistic]);
    const { data, error } = await supabase.from('leftovers').insert({
      household_id: household.id, recipe_id: recipeId,
      servings_left: servingsLeft, notes
    }).select().single();
    if (error) {
      setLeftovers(prev => prev.filter(l => l.id !== tempId));
      console.error('addLeftover error:', error);
      return;
    }
    setLeftovers(prev => prev.map(l => l.id === tempId ? data : l));
  };

  const consumeLeftover = async (id, count = 1) => {
    const left = leftovers.find(l => l.id === id);
    if (!left) return;
    const newCount = Math.max(0, left.servings_left - count);
    if (newCount === 0) {
      // Remove from UI
      suppressedDeletesRef.current.add(id);
      setLeftovers(prev => prev.filter(l => l.id !== id));
      if (!(typeof id === 'string' && id.startsWith('temp_'))) {
        await supabase.from('leftovers').delete().eq('id', id);
      }
      setTimeout(() => suppressedDeletesRef.current.delete(id), 5000);
    } else {
      setLeftovers(prev => prev.map(l => l.id === id ? { ...l, servings_left: newCount } : l));
      if (!(typeof id === 'string' && id.startsWith('temp_'))) {
        await supabase.from('leftovers').update({
          servings_left: newCount, updated_at: new Date().toISOString()
        }).eq('id', id);
      }
    }
  };

  const deleteLeftover = async (id) => {
    suppressedDeletesRef.current.add(id);
    setLeftovers(prev => prev.filter(l => l.id !== id));
    if (!(typeof id === 'string' && id.startsWith('temp_'))) {
      await supabase.from('leftovers').delete().eq('id', id);
    }
    setTimeout(() => suppressedDeletesRef.current.delete(id), 5000);
  };

  // ---- Photo ops
  const uploadPhoto = async (recipeId, file, notes = null, userId = null) => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `${userId || 'anon'}/${household.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('recipe-photos').upload(filename, file, {
      contentType: file.type,
      upsert: false
    });
    if (upErr) {
      console.error('Photo upload failed:', upErr);
      throw upErr;
    }
    const { data: { publicUrl } } = supabase.storage.from('recipe-photos').getPublicUrl(filename);

    const { data, error } = await supabase.from('recipe_photos').insert({
      household_id: household.id, recipe_id: recipeId,
      storage_path: filename, public_url: publicUrl, notes,
      created_by: userId
    }).select().single();
    if (error) throw error;
    setPhotos(prev => [data, ...prev]);
    return data;
  };

  const deletePhoto = async (photo) => {
    suppressedDeletesRef.current.add(photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    if (photo.storage_path) {
      await supabase.storage.from('recipe-photos').remove([photo.storage_path]);
    }
    await supabase.from('recipe_photos').delete().eq('id', photo.id);
    setTimeout(() => suppressedDeletesRef.current.delete(photo.id), 5000);
  };

  // ---- Cooking log ops
  const logCooking = async (recipeId, servingsMade, rating = null, notes = null, userId = null) => {
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const optimistic = {
      id: tempId, household_id: household.id, recipe_id: recipeId,
      cooked_on: new Date().toISOString().slice(0, 10),
      servings_made: servingsMade, rating, notes, cooked_by: userId,
      _temp: true
    };
    setCookingLog(prev => [optimistic, ...prev]);
    // Update last_cooked_on on the recipe
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, last_cooked_on: optimistic.cooked_on } : r));

    try {
      const { data, error } = await supabase.from('cooking_log').insert({
        household_id: household.id, recipe_id: recipeId,
        servings_made: servingsMade, rating, notes, cooked_by: userId
      }).select().single();
      if (error) throw error;
      setCookingLog(prev => prev.map(l => l.id === tempId ? data : l));
      // Update last_cooked_on in DB
      await supabase.from('recipes')
        .update({ last_cooked_on: optimistic.cooked_on })
        .eq('id', recipeId);
      return data;
    } catch (err) {
      // Rollback on failure
      setCookingLog(prev => prev.filter(l => l.id !== tempId));
      console.error('logCooking error:', err);
    }
  };

  const updateCookingLogRating = async (logId, rating) => {
    setCookingLog(prev => prev.map(l => l.id === logId ? { ...l, rating } : l));
    if (typeof logId === 'string' && logId.startsWith('temp_')) return;
    await supabase.from('cooking_log').update({ rating }).eq('id', logId);
  };

  // ---- Undo: restore most recently deleted item within 30s
  const trackDeleteForUndo = (kind, row) => {
    lastDeleteRef.current = { kind, row, at: Date.now() };
    setLastDeleteAt(Date.now()); // trigger re-render so UI shows toast
  };
  const undoLastDelete = async () => {
    const last = lastDeleteRef.current;
    if (!last) return false;
    if (Date.now() - last.at > 30000) return false; // 30 sec window
    lastDeleteRef.current = null;
    const { kind, row } = last;
    try {
      if (kind === 'recipe') {
        await supabase.from('recipes').insert({
          ...row,
          // Drop computed/normalized fields
          createdAt: undefined,
          timeMin: undefined
        });
      } else if (kind === 'pantry') {
        await supabase.from('pantry').insert(row);
      } else if (kind === 'week_plan') {
        await supabase.from('week_plan').insert({
          household_id: row.household_id, recipe_id: row.recipe_id,
          day: row.day, servings: row.servings
        });
      }
      await loadAll();
      return true;
    } catch (e) {
      console.error('undo failed:', e);
      return false;
    }
  };

  const recipesNormalized = recipes.map(r => ({
    ...r,
    timeMin: r.time_min,
    mealType: r.meal_type || r.mealType,
    leftoverFriendly: r.leftover_friendly !== undefined ? r.leftover_friendly : r.leftoverFriendly,
    costcoSourcing: r.costco_sourcing || r.costcoSourcing,
    noTomatoNote: r.no_tomato_note || r.noTomatoNote,
    noCilantroNote: r.no_cilantro_note || r.noCilantroNote,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now()
  }));

  return {
    recipes: recipesNormalized,
    weekPlan,
    pantry,
    leftovers,
    photos,
    cookingLog,
    loading,
    addRecipe, updateRecipe, deleteRecipe,
    addToWeek, removeFromWeek, updateWeekServings, updateWeekDay, updateWeekMealSlot,
    addPantry, updatePantry, deletePantry,
    addLeftover, consumeLeftover, deleteLeftover,
    uploadPhoto, deletePhoto,
    logCooking, updateCookingLogRating,
    trackDeleteForUndo, undoLastDelete,
    lastDeleteAt,
    lastDeleteKind: lastDeleteRef.current?.kind,
    lastDeleteName: lastDeleteRef.current?.row?.name || lastDeleteRef.current?.row?.title || 'item',
    reload: loadAll
  };
}
