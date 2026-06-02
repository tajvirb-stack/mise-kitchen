// Macro-aware variant of generateSmartWeekPlan
// Picks recipes that, in total, get closest to the user's daily protein target.

import { generateSmartWeekPlan } from './suggestions';

export function generateMacroAwareWeekPlan(allRecipes, count, pantry, targets) {
  if (!allRecipes?.length) return [];
  if (!targets) return generateSmartWeekPlan(allRecipes, count, pantry, true);

  // Run the standard smart plan first (handles pantry/variety)
  const initial = generateSmartWeekPlan(allRecipes, count * 2, pantry, true);

  // Then rerank top candidates to hit protein target
  const proteinTarget = targets.protein_target || 190;
  const calorieTarget = targets.calories_target || 2300;
  const fiberTarget = targets.fiber_target || 50;

  // Score each candidate by macro fit (higher protein, reasonable calories)
  const scored = initial.map(r => {
    const n = r.nutrition || {};
    const proteinScore = (n.protein || 0) / proteinTarget;        // 0..1
    const calorieScore = 1 - Math.abs(((n.calories || 700) - calorieTarget / 3) / (calorieTarget / 3)); // closer to target/3 is better
    const fiberScore = (n.fiber || 0) / (fiberTarget / 3);
    const score = proteinScore * 2 + calorieScore + fiberScore * 0.5;
    return { recipe: r, score };
  }).sort((a, b) => b.score - a.score);

  // Take top `count` unique recipes
  return scored.slice(0, count).map(s => s.recipe);
}

// Compute projected daily totals from a planned day's recipes
export function projectDailyMacros(dayPlans, recipes) {
  let cal = 0, protein = 0, fiber = 0, sodium = 0;
  for (const plan of dayPlans) {
    const recipe = recipes.find(r => r.id === plan.recipe_id);
    if (!recipe?.nutrition) continue;
    const servings = plan.servings || 1;
    cal += (recipe.nutrition.calories || 0) * servings;
    protein += (recipe.nutrition.protein || 0) * servings;
    fiber += (recipe.nutrition.fiber || 0) * servings;
    sodium += (recipe.nutrition.sodium || 0) * servings;
  }
  return { calories: cal, protein, fiber, sodium };
}
