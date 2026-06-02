import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useHousehold, useHouseholdData } from './lib/state';
import { aggregateWeeklyIngredients, computeGroceryList, detectPrepTasks } from './lib/utils';
import { resolveIngredient } from './lib/recipe-variants';
import AuthScreen from './views/AuthScreen.jsx';
import HouseholdSetup from './views/HouseholdSetup.jsx';
import Kitchen from './views/Kitchen.jsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { household, members, loading: hhLoading, error: hhError, createHousehold, joinHousehold } = useHousehold(user);
  const data = useHouseholdData(household);

  // Equipment + ingredient mode — persisted across sessions via localStorage.
  // Lives here so that grocery list aggregation can swap ingredient quantities
  // when the user is in "paste" mode (paste needs less than fresh, etc.).
  const [equipmentMode, setEquipmentModeRaw] = useState(() => {
    try { return localStorage.getItem('mise_equipment_mode') || 'oven'; } catch { return 'oven'; }
  });
  const [ingredientMode, setIngredientModeRaw] = useState(() => {
    try { return localStorage.getItem('mise_ingredient_mode') || 'fresh'; } catch { return 'fresh'; }
  });
  const setEquipmentMode = (m) => {
    setEquipmentModeRaw(m);
    try { localStorage.setItem('mise_equipment_mode', m); } catch {}
  };
  const setIngredientMode = (m) => {
    setIngredientModeRaw(m);
    try { localStorage.setItem('mise_ingredient_mode', m); } catch {}
  };
  const modes = { equipmentMode, setEquipmentMode, ingredientMode, setIngredientMode };

  // When building the week's ingredient totals, apply the user's ingredient mode
  // so that selecting "paste" actually changes what shows up in the grocery list.
  const modeAwareRecipes = useMemo(() => {
    if (ingredientMode === 'fresh') return data.recipes;
    return data.recipes.map(r => ({
      ...r,
      ingredients: (r.ingredients || []).map(ing => resolveIngredient(ing, ingredientMode))
    }));
  }, [data.recipes, ingredientMode]);

  const weeklyIngredients = useMemo(
    () => aggregateWeeklyIngredients(data.weekPlan, modeAwareRecipes),
    [data.weekPlan, modeAwareRecipes]
  );
  const groceryList = useMemo(
    () => computeGroceryList(weeklyIngredients, data.pantry),
    [weeklyIngredients, data.pantry]
  );
  const prepTasks = useMemo(
    () => detectPrepTasks(data.weekPlan, modeAwareRecipes),
    [data.weekPlan, modeAwareRecipes]
  );

  if (authLoading || (user && hhLoading)) {
    return <FullPageSpinner label={authLoading ? 'Loading…' : 'Setting your table…'} />;
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  if (!household) {
    return <HouseholdSetup user={user} onCreate={createHousehold} onJoin={joinHousehold} error={hhError} />;
  }

  return (
    <Kitchen
      user={user}
      household={household}
      members={members}
      data={data}
      weeklyIngredients={weeklyIngredients}
      groceryList={groceryList}
      prepTasks={prepTasks}
      modes={modes}
      onSignOut={signOut}
    />
  );
}

function FullPageSpinner({ label }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF6EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Loader2 size={28} color="#A85C32" className="spin" />
      <div style={{ color: '#8B6F47', fontSize: 14 }}>{label}</div>
    </div>
  );
}
