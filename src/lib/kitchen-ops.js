// Operations that read/write across multiple tables.
// These take the data hook so they can call optimistic ops directly.

import { foldName, normalizeUnit, convertQty, pantryNameMatch } from './utils';

// ============================================================================
// AUTO-DEDUCT — when you cook a recipe, subtract used ingredients from pantry
// ============================================================================
// Returns a list of {pantryId, oldQty, newQty, ingName} entries describing what changed,
// so the UI can show "we used X g flour and Y eggs from your pantry".

export async function autoDeductPantry(recipe, scale, pantry, data) {
  if (!recipe?.ingredients || !pantry || pantry.length === 0) return [];
  const changes = [];

  for (const ing of recipe.ingredients) {
    const ingUnit = normalizeUnit(ing.unit);
    const requiredQty = (ing.qty || 0) * scale;
    if (requiredQty <= 0) continue;

    // Match by name (exact/synonym), then deduct in the PANTRY item's unit.
    const match = pantry.find(p => Number(p.qty) > 0 && pantryNameMatch(p.name, ing.name));
    if (!match) continue;

    const pUnit = normalizeUnit(match.unit);
    // Convert the required amount into the pantry item's unit. If the units are
    // incompatible (e.g. recipe tsp vs a whole jar), skip rather than guess —
    // the old code deducted the raw number regardless of unit, which turned
    // "250 g" into "250 units" and wiped whole pantry items.
    const reqInPantryUnit = convertQty(requiredQty, ingUnit, pUnit);
    if (reqInPantryUnit == null) continue;
    const consumed = Math.min(Number(match.qty), reqInPantryUnit);
    if (consumed <= 0) continue;
    const newQty = Math.max(0, Number(match.qty) - consumed);
    changes.push({
      pantryId: match.id,
      ingName: ing.name,
      pantryName: match.name,
      consumed,
      newQty,
      unit: match.unit,
      willDelete: newQty <= 0
    });

    // Apply the change
    if (newQty <= 0) {
      await data.deletePantry(match.id);
    } else {
      await data.updatePantry(match.id, { qty: newQty });
    }
  }
  return changes;
}

// ============================================================================
// EXPIRATION — flag pantry items that are expiring soon
// ============================================================================

export function daysUntilExpiry(expiresOn) {
  if (!expiresOn) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiresOn + 'T00:00:00');
  return Math.floor((exp - now) / (1000 * 60 * 60 * 24));
}

export function expiryStatus(pantryItem) {
  const days = daysUntilExpiry(pantryItem.expires_on);
  if (days === null) return null; // No expiry tracked
  if (days < 0) return { level: 'expired', label: `expired ${-days}d ago`, color: '#A85C32', bg: '#FFE4D6' };
  if (days === 0) return { level: 'today', label: 'expires today', color: '#A85C32', bg: '#FFE4D6' };
  if (days <= 2) return { level: 'urgent', label: `${days}d left`, color: '#A85C32', bg: '#FFE4D6' };
  if (days <= 5) return { level: 'soon', label: `${days}d left`, color: '#7A5C32', bg: '#FAF1DC' };
  return { level: 'ok', label: `${days}d`, color: '#5C7A3A', bg: '#F0F5E8' };
}

// Suggest recipes that use ingredients about to expire
export function suggestUseSoon(allRecipes, pantry, weekPlan) {
  const expiring = pantry.filter(p => {
    const status = expiryStatus(p);
    return status && (status.level === 'urgent' || status.level === 'today' || status.level === 'soon');
  });
  if (expiring.length === 0) return [];

  const expiringNames = expiring.map(p => foldName(p.name));
  const plannedIds = new Set(weekPlan.map(w => w.recipe_id));

  const matches = [];
  for (const recipe of allRecipes) {
    if (plannedIds.has(recipe.id)) continue;
    const matchedIngs = (recipe.ingredients || [])
      .map(i => foldName(i.name))
      .filter(folded => expiringNames.some(en => folded.includes(en) || en.includes(folded)));
    if (matchedIngs.length > 0) {
      matches.push({
        recipe,
        usesExpiring: matchedIngs.length,
        items: expiring.filter(p => {
          const pf = foldName(p.name);
          return (recipe.ingredients || []).some(i => {
            const fi = foldName(i.name);
            return fi.includes(pf) || pf.includes(fi);
          });
        })
      });
    }
  }
  matches.sort((a, b) => b.usesExpiring - a.usesExpiring);
  return matches.slice(0, 3);
}

// ============================================================================
// BATCH PREP PLANNER — groups overlapping prep across week_plan recipes
// ============================================================================
// Output: ordered list of grouped tasks like:
//   { title: "Chop onions", recipes: [...], totalQty: 3, unit: 'whole' }
//
// Builds on the existing detectPrepTasks but groups by canonical ingredient
// across recipes and gives a more guided sequence.

const PREP_VERBS = [
  // canonical task → matching keywords in step text
  { task: 'Chop onions',       match: /chop|dice|slice.*onion|onion.*chop|onion.*dice|onion.*slice/i },
  { task: 'Mince garlic',      match: /mince.*garlic|garlic.*mince|grate.*garlic|garlic.*grate/i },
  { task: 'Grate ginger',      match: /grate.*ginger|ginger.*grate|peel.*grate.*ginger/i },
  { task: 'Mince herbs',       match: /chop.*(parsley|cilantro|mint|basil|thyme|oregano|dill|tarragon|rosemary)/i },
  { task: 'Cut peppers',       match: /(slice|chop|dice|cut).*(bell pepper|red pepper|yellow pepper|chili|jalapeño|jalapeno)/i },
  { task: 'Cut carrots',       match: /(slice|chop|dice|cut|peel).*(carrot)/i },
  { task: 'Cut zucchini',      match: /(slice|chop|dice|cut|halve).*(zucchini|squash)/i },
  { task: 'Cut potatoes',      match: /(cut|chop|dice|slice|halve|wedge).*(potato|sweet potato)/i },
  { task: 'Slice green onions',match: /(slice|chop).*green onion|green onion.*(slice|chop)|scallion/i },
  { task: 'Make spice mixes',  match: /spice mix|seasoning mix|moroccan spice|mexican spice|tex.?mex|garam masala mix/i },
  { task: 'Mix sauces',        match: /(yogurt sauce|spicy mayo|honey.?garlic sauce|kung pao sauce|nuoc cham|piri piri sauce|ginger sauce|bang bang|tikka sauce|tex.?mex paste|plum sauce)/i },
  { task: 'Drain canned beans',match: /(drain|rinse).*(chickpea|bean|lentil)/i },
  { task: 'Pat protein dry',   match: /pat (chicken|salmon|beef|fish|turkey|pork|shrimp|tofu) dry/i },
  { task: 'Zest + juice citrus', match: /(zest|juice).*(lemon|lime|orange)/i }
];

export function buildBatchPrepPlan(weekPlan, recipes) {
  if (!weekPlan || weekPlan.length === 0) return [];
  const tasks = {};
  // For each recipe in the week plan, scan its prep steps and bucket them
  for (const w of weekPlan) {
    const recipe = recipes.find(r => r.id === w.recipe_id);
    if (!recipe) continue;
    const prepSteps = (recipe.steps || []).filter(s => (s.phase || 'cook') === 'prep');
    for (const step of prepSteps) {
      const text = step.text || '';
      for (const verb of PREP_VERBS) {
        if (verb.match.test(text)) {
          if (!tasks[verb.task]) tasks[verb.task] = { task: verb.task, recipes: [], steps: [] };
          if (!tasks[verb.task].recipes.find(r => r.id === recipe.id)) {
            tasks[verb.task].recipes.push({ id: recipe.id, title: recipe.title, day: w.day, image: recipe.image });
          }
          tasks[verb.task].steps.push({ recipeTitle: recipe.title, text, day: w.day });
        }
      }
    }
  }
  // Only show tasks that span 2+ recipes (the batch insight)
  return Object.values(tasks).filter(t => t.recipes.length >= 2)
    .sort((a, b) => b.recipes.length - a.recipes.length);
}

// ============================================================================
// COOKING STATS — derived from cooking_log table
// ============================================================================

export function calcCookingStats(cookingLog, days = 30) {
  if (!cookingLog || cookingLog.length === 0) {
    return { totalCooked: 0, lastWeek: 0, currentStreak: 0, mostCooked: null, avgRating: null };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  const recent = cookingLog.filter(l => {
    const d = new Date(l.cooked_on + 'T00:00:00');
    return d >= cutoff;
  });

  // Week count
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const lastWeek = cookingLog.filter(l => new Date(l.cooked_on + 'T00:00:00') >= weekAgo).length;

  // Streak — consecutive days with at least one cook
  const dates = new Set(cookingLog.map(l => l.cooked_on));
  let streak = 0;
  let cursor = new Date(now);
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Most cooked
  const counts = {};
  cookingLog.forEach(l => { counts[l.recipe_id] = (counts[l.recipe_id] || 0) + 1; });
  const mostId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  // Avg rating
  const ratings = cookingLog.filter(l => l.rating);
  const avgRating = ratings.length > 0
    ? ratings.reduce((s, l) => s + l.rating, 0) / ratings.length
    : null;

  return {
    totalCooked: cookingLog.length,
    lastWeek,
    currentStreak: streak,
    mostCookedId: mostId,
    avgRating
  };
}
