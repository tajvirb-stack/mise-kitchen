import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const NutritionContext = createContext(null);

export function NutritionProvider({ children }) {
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [targets, setTargets] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [quickAdds, setQuickAdds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: targetData } = await supabase
      .from('user_nutrition_targets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setTargets(targetData || {
      calories_target: 2300,
      protein_target: 190,
      fiber_target: 50,
      sodium_max: 2300,
    });

    const { data: logData } = await supabase
      .from('food_log')
      .select('*, recipes(title, nutrition, image)')
      .eq('user_id', user.id)
      .eq('log_date', date)
      .order('logged_at');

    setLogEntries(logData || []);

    const { data: quickAddData } = await supabase
      .from('quick_add_foods')
      .select('*')
      .eq('user_id', user.id)
      .order('protein', { ascending: false });

    setQuickAdds(quickAddData || []);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription — auto-update when anything changes
  useEffect(() => {
    let userId = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;
      const ch = supabase.channel('nutrition_' + userId)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'food_log', filter: `user_id=eq.${userId}` },
          () => fetchData())
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'user_nutrition_targets', filter: `user_id=eq.${userId}` },
          () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    })();
  }, [fetchData]);

  // Compute totals
  const totals = logEntries.reduce((acc, entry) => {
    const mult = entry.servings || 1;
    return {
      calories: acc.calories + (entry.calories || 0) * mult,
      protein: acc.protein + (entry.protein || 0) * mult,
      fat: acc.fat + (entry.fat || 0) * mult,
      carbs: acc.carbs + (entry.carbs || 0) * mult,
      fiber: acc.fiber + (entry.fiber || 0) * mult,
      sodium: acc.sodium + (entry.sodium || 0) * mult,
    };
  }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 });

  // Log a recipe (used by auto-log when cooking)
  const logRecipe = async (recipe, servings = 1, mealSlot = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const n = recipe.nutrition || {};
    await supabase.from('food_log').insert({
      user_id: user.id,
      log_date: date,
      meal_slot: mealSlot || recipe.mealType || recipe.meal_type || 'dinner',
      source_type: 'recipe',
      recipe_id: recipe.dbId || recipe.id,
      servings,
      calories: n.calories,
      protein: n.protein,
      fat: n.fat,
      carbs: n.carbs,
      fiber: n.fiber,
      sodium: n.sodium,
    });
    // Realtime will trigger refresh; but call directly for immediacy
    await fetchData();
  };

  const logQuickAdd = async (item, servings = 1, mealSlot) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('food_log').insert({
      user_id: user.id,
      log_date: date,
      meal_slot: mealSlot,
      source_type: 'quick_add',
      custom_name: item.name,
      emoji: item.emoji,
      servings,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      fiber: item.fiber,
      sodium: item.sodium,
    });
    await fetchData();
  };

  const deleteEntry = async (entryId) => {
    await supabase.from('food_log').delete().eq('id', entryId);
    await fetchData();
  };

  const value = {
    date,
    targets,
    logEntries,
    quickAdds,
    totals,
    loading,
    logRecipe,
    logQuickAdd,
    deleteEntry,
    refetch: fetchData,
  };

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}

export function useNutritionContext() {
  const ctx = useContext(NutritionContext);
  if (!ctx) {
    // Graceful fallback: provider not mounted yet
    return {
      targets: null, logEntries: [], quickAdds: [], totals: { calories: 0, protein: 0, fiber: 0, sodium: 0 },
      loading: true, logRecipe: () => {}, logQuickAdd: () => {}, deleteEntry: () => {}, refetch: () => {},
    };
  }
  return ctx;
}
