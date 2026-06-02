// Smart suggestions for ingredients:
//   - Substitutes for hard-to-find or unavailable items
//   - Healthier alternatives where appropriate
//   - Pantry-aware swaps
//
// Each entry: a list of partial-match keys, then suggestions.

export const SUBSTITUTES = [
  // === Asian aisle items ===
  {
    matches: ['hoisin'],
    howToMake: 'Mix: 2 tbsp BBQ sauce + 1 tbsp soy sauce + ½ tsp Chinese five-spice + 1 tsp sugar.',
    label: 'hoisin sauce',
    substitutes: [
      { type: 'replace', text: 'Equal parts: BBQ sauce + soy sauce + a pinch of Chinese five-spice', healthier: false },
      { type: 'replace', text: 'Mix peanut butter + soy sauce + brown sugar + rice vinegar (1:1:1:0.5)', healthier: false }
    ]
  },
  {
    matches: ['fish sauce'],
    howToMake: 'Mix: 1 tbsp soy sauce + ¼ tsp anchovy paste (or 1 small anchovy, mashed).',
    label: 'fish sauce',
    substitutes: [
      { type: 'replace', text: 'Soy sauce + a tiny bit of anchovy paste (¼ tsp per tbsp soy)', healthier: false },
      { type: 'vegan', text: 'Vegan: equal parts soy sauce + miso paste + lime juice', healthier: false }
    ]
  },
  {
    matches: ['sambal', 'chili-garlic sauce'],
    label: 'sambal oelek / chili-garlic sauce',
    substitutes: [
      { type: 'replace', text: 'Sriracha works (slightly sweeter)', healthier: false },
      { type: 'replace', text: 'Red pepper flakes + a splash of rice vinegar + 1 grated garlic clove', healthier: false }
    ]
  },
  {
    matches: ['sweet chili'],
    howToMake: 'Mix: 2 tbsp honey + 1 tsp sriracha + 1 tsp rice vinegar. Adjust heat to taste.',
    label: 'sweet chili sauce',
    substitutes: [
      { type: 'replace', text: 'Equal parts honey + sriracha + rice vinegar', healthier: false },
      { type: 'replace', text: 'Apricot jam + a few drops of hot sauce + a pinch of garlic powder', healthier: false }
    ]
  },
  {
    matches: ['lemongrass'],
    howToMake: 'Use 1 tbsp Gourmet Garden lemongrass paste per stalk. No prep needed.',
    label: 'fresh lemongrass',
    substitutes: [
      { type: 'replace', text: '1 tbsp lemongrass paste (jarred — Gourmet Garden brand) per stalk', healthier: false },
      { type: 'replace', text: 'Use 1 tsp lemon zest + ½ tsp grated ginger per stalk (different but works)', healthier: false }
    ]
  },
  {
    matches: ['rice vermicelli', 'rice noodle'],
    label: 'rice noodles',
    substitutes: [
      { type: 'replace', text: 'Thin spaghetti or angel hair (cook 1 min less than package says)', healthier: false }
    ]
  },
  {
    matches: ['mango chutney'],
    howToMake: 'Mix: 2 tbsp apricot jam + ½ tsp curry powder + ½ tsp lime juice + tiny pinch of cayenne.',
    label: 'mango chutney',
    substitutes: [
      { type: 'replace', text: 'Apricot jam + ½ tsp curry powder + dash of lime juice + pinch cayenne', healthier: false }
    ]
  },

  // === Cheeses ===
  {
    matches: ['feta'],
    label: 'feta cheese',
    substitutes: [
      { type: 'replace', text: 'Goat cheese — similar tang, creamier', healthier: false },
      { type: 'vegan', text: 'Crumbled tofu seasoned with lemon juice + salt + ½ tsp nutritional yeast', healthier: true }
    ]
  },
  {
    matches: ['mexican blend cheese', 'mexican cheese'],
    label: 'mexican blend cheese',
    substitutes: [
      { type: 'replace', text: 'Plain shredded cheddar + monterey jack (50/50)', healthier: false },
      { type: 'healthier', text: 'Use ⅔ the amount but a more flavorful aged cheese (sharp cheddar)', healthier: true }
    ]
  },
  {
    matches: ['heavy cream', 'whipping cream'],
    label: 'heavy cream',
    substitutes: [
      { type: 'replace', text: 'Whole milk + 1 tbsp butter melted in (per ¼ cup)', healthier: false },
      { type: 'healthier', text: 'Greek yogurt or unsweetened coconut milk', healthier: true },
      { type: 'vegan', text: 'Full-fat coconut cream', healthier: true }
    ]
  },
  {
    matches: ['sour cream'],
    label: 'sour cream',
    substitutes: [
      { type: 'healthier', text: 'Plain Greek yogurt — same texture, more protein, less fat', healthier: true },
      { type: 'vegan', text: 'Cashew cream (soaked cashews blended with lemon juice)', healthier: true }
    ]
  },

  // === Healthier swaps ===
  {
    matches: ['ground beef'],
    label: 'ground beef',
    substitutes: [
      { type: 'healthier', text: 'Ground turkey or chicken (use 90/10 lean)', healthier: true },
      { type: 'healthier', text: 'Lentils (especially cooked black lentils — similar texture)', healthier: true },
      { type: 'vegan', text: 'Crumbled extra-firm tofu or plant-based "ground" (Beyond, Impossible)', healthier: true }
    ]
  },
  {
    matches: ['mayonnaise', 'mayo'],
    label: 'mayonnaise',
    substitutes: [
      { type: 'healthier', text: 'Greek yogurt — most uses (sauces, dressings) work great with this swap', healthier: true },
      { type: 'healthier', text: 'Avocado mashed (especially in cold salads)', healthier: true }
    ]
  },
  {
    matches: ['white rice', 'jasmine rice', 'long-grain rice'],
    label: 'white rice',
    substitutes: [
      { type: 'healthier', text: 'Brown rice or quinoa (cook longer, ~30 min)', healthier: true },
      { type: 'healthier', text: 'Cauliflower rice (much lower carb, cook 5-7 min)', healthier: true }
    ]
  },
  {
    matches: ['pasta', 'linguine', 'spaghetti'],
    label: 'pasta',
    substitutes: [
      { type: 'healthier', text: 'Whole wheat pasta — same recipe, more fiber', healthier: true },
      { type: 'healthier', text: 'Chickpea or lentil pasta — much more protein', healthier: true },
      { type: 'healthier', text: 'Zucchini noodles for half the pasta (cook just 2 min)', healthier: true }
    ]
  },
  {
    matches: ['bulgur'],
    label: 'bulgur',
    substitutes: [
      { type: 'replace', text: 'Couscous (faster — 5 min) or quinoa (~15 min)', healthier: false }
    ]
  },
  {
    matches: ['potato', 'potatoes'],
    label: 'potatoes',
    substitutes: [
      { type: 'healthier', text: 'Sweet potatoes (more nutrients, similar prep)', healthier: true },
      { type: 'healthier', text: 'Cauliflower or radishes (lower carb, similar texture when roasted)', healthier: true }
    ]
  },
  {
    matches: ['butter'],
    label: 'butter',
    substitutes: [
      { type: 'healthier', text: 'Olive oil (use ¾ the amount)', healthier: true },
      { type: 'vegan', text: 'Vegan butter or olive oil', healthier: false }
    ]
  },
  {
    matches: ['flatbread', 'naan'],
    label: 'flatbread / naan',
    substitutes: [
      { type: 'replace', text: 'Pita bread, large flour tortillas, or pizza crust', healthier: false },
      { type: 'healthier', text: 'Whole wheat or low-carb tortillas', healthier: true }
    ]
  },

  // === Hard-to-find produce ===
  {
    matches: ['bok choy'],
    label: 'bok choy',
    substitutes: [
      { type: 'replace', text: 'Napa cabbage or baby spinach (add at the end, cook briefly)', healthier: false },
      { type: 'replace', text: 'Swiss chard — cook stems first, then leaves', healthier: false }
    ]
  },
  {
    matches: ['snow peas', 'snap peas', 'sugar snap'],
    label: 'snow / snap peas',
    substitutes: [
      { type: 'replace', text: 'Green beans (cut in half), or broccoli florets', healthier: false }
    ]
  },
  {
    matches: ['shallot'],
    label: 'shallots',
    substitutes: [
      { type: 'replace', text: 'A small piece of red onion + 1 minced garlic clove', healthier: false }
    ]
  },

  // === Specific brand items ===
  {
    matches: ['better than bouillon', 'stock paste', 'broth concentrate'],
    label: 'stock paste / broth concentrate',
    substitutes: [
      { type: 'replace', text: '1 bouillon cube crushed = 1 tsp stock paste', healthier: false },
      { type: 'replace', text: '½ cup of regular broth = 1 tsp paste + ½ cup water', healthier: false }
    ]
  },
  {
    matches: ['crispy fried shallot', 'crispy shallot'],
    label: 'crispy fried shallots',
    substitutes: [
      { type: 'replace', text: 'French\'s fried onions — works in a pinch, slightly different flavor', healthier: false },
      { type: 'replace', text: 'Toasted panko breadcrumbs (similar crunch, no shallot flavor)', healthier: false }
    ]
  },
  {
    matches: ['edamame'],
    label: 'edamame',
    substitutes: [
      { type: 'replace', text: 'Frozen peas or frozen lima beans', healthier: false }
    ]
  }
];

// Find all relevant substitutions for an ingredient name (returns array — could be multiple matches)
export function findSubstitutes(ingredientName) {
  if (!ingredientName) return null;
  const lower = ingredientName.toLowerCase();
  for (const entry of SUBSTITUTES) {
    if (entry.matches.some(m => lower.includes(m))) {
      return entry;
    }
  }
  return null;
}

// Given all recipes + week plan, suggest recipes that share ingredients with what's already planned
// (so you can buy fewer ingredients overall).
// Returns top 3 unplanned recipes ranked by overlapping ingredient count with the planned recipes.
export function suggestSimilarRecipes(allRecipes, weekPlan) {
  const plannedIds = new Set(weekPlan.map(w => w.recipe_id));
  if (plannedIds.size === 0) return [];

  // Collect all ingredient names from planned recipes
  const plannedIngredients = new Set();
  weekPlan.forEach(w => {
    const r = allRecipes.find(x => x.id === w.recipe_id);
    if (!r) return;
    (r.ingredients || []).forEach(ing => {
      const lower = (ing.name || '').toLowerCase();
      // Extract main ingredient noun (strip qualifiers)
      const stripped = lower
        .replace(/\b(fresh|dried|chopped|minced|diced|sliced|grated|ground|whole|peeled|small|medium|large)\b/g, '')
        .replace(/\([^)]*\)/g, '')  // strip parens
        .trim();
      stripped.split(/[,;]/).forEach(part => {
        const cleaned = part.trim();
        if (cleaned.length > 2) plannedIngredients.add(cleaned);
      });
    });
  });

  // Score each unplanned recipe by overlap
  const scored = allRecipes
    .filter(r => !plannedIds.has(r.id))
    .map(r => {
      const ingredients = (r.ingredients || []).map(i => (i.name || '').toLowerCase());
      const overlap = ingredients.filter(ing => {
        return [...plannedIngredients].some(p => ing.includes(p) && p.length > 3);
      }).length;
      return { recipe: r, overlap };
    })
    .filter(x => x.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3);

  return scored;
}

// Suggest recipes whose ingredients you mostly already have in your pantry
export function suggestPantryFriendly(allRecipes, pantry, weekPlan) {
  if (!pantry || pantry.length === 0) return [];
  const plannedIds = new Set(weekPlan.map(w => w.recipe_id));
  const pantryNames = pantry.map(p => (p.name || '').toLowerCase());

  const scored = allRecipes
    .filter(r => !plannedIds.has(r.id))
    .map(r => {
      const ingredients = (r.ingredients || []).map(i => (i.name || '').toLowerCase());
      const matched = ingredients.filter(ing =>
        pantryNames.some(p => ing.includes(p) && p.length > 2)
      ).length;
      return { recipe: r, matched, total: ingredients.length, ratio: matched / Math.max(1, ingredients.length) };
    })
    .filter(x => x.matched >= 3 || x.ratio >= 0.3)
    .sort((a, b) => b.matched - a.matched)
    .slice(0, 3);

  return scored;
}

// ============================================================================
// SMART WEEK PLAN — pick N recipes that maximize ingredient overlap
// ============================================================================
// Greedy algorithm: pick first recipe arbitrarily, then for each subsequent
// pick, choose the recipe whose ingredients overlap most with the running set.

function ingredientKey(name) {
  return (name || '').toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(fresh|dried|chopped|minced|diced|sliced|grated|ground|whole|peeled|small|medium|large|boneless|skinless)\b/g, '')
    .replace(/[,;].*$/, '')
    .trim();
}

function recipeIngredientSet(recipe) {
  const ings = (recipe.ingredients || []).map(i => ingredientKey(i.name)).filter(Boolean);
  return new Set(ings);
}

export function generateSmartWeekPlan(allRecipes, count = 7, pantry = [], proteinDiversity = true) {
  if (!allRecipes || allRecipes.length === 0) return [];
  const available = [...allRecipes];
  if (available.length === 0) return [];

  const pantryKeys = new Set((pantry || []).map(p => ingredientKey(p.name)).filter(Boolean));

  // Score each recipe by:
  //   + 2 points per pantry match
  //   + 1 point per overlap with already-picked recipes
  //   - 5 points if same protein as immediately preceding pick (variety)
  const picked = [];
  const usedIngredients = new Set();
  const proteinCounts = {};

  while (picked.length < count && available.length > 0) {
    let bestRecipe = null;
    let bestScore = -Infinity;

    for (const recipe of available) {
      const ingSet = recipeIngredientSet(recipe);
      let score = 0;

      // Pantry bonus
      for (const ing of ingSet) {
        if (pantryKeys.size > 0) {
          for (const pk of pantryKeys) {
            if (ing.includes(pk) && pk.length > 3) { score += 2; break; }
          }
        }
      }
      // Overlap bonus
      for (const ing of ingSet) {
        if (usedIngredients.has(ing)) score += 1;
      }
      // Protein-diversity penalty
      if (proteinDiversity && picked.length > 0) {
        const prevProtein = (picked[picked.length - 1].ingredients || []).find(i => i.protein);
        const thisProtein = (recipe.ingredients || []).find(i => i.protein);
        if (prevProtein && thisProtein && ingredientKey(prevProtein.name) === ingredientKey(thisProtein.name)) {
          score -= 5;
        }
      }

      if (score > bestScore) { bestScore = score; bestRecipe = recipe; }
    }

    if (!bestRecipe) bestRecipe = available[0];
    picked.push(bestRecipe);
    const ingSet = recipeIngredientSet(bestRecipe);
    ingSet.forEach(i => usedIngredients.add(i));
    const idx = available.indexOf(bestRecipe);
    available.splice(idx, 1);
  }

  return picked;
}

// Score a recipe by how well it pairs with the current week plan (used for badges)
export function pairScore(recipe, allRecipes, weekPlan) {
  const plannedIds = new Set(weekPlan.map(w => w.recipe_id));
  if (plannedIds.has(recipe.id) || plannedIds.size === 0) return 0;
  const planned = weekPlan.map(w => allRecipes.find(r => r.id === w.recipe_id)).filter(Boolean);
  const recipeIngs = recipeIngredientSet(recipe);
  let count = 0;
  const seenInPlanned = new Set();
  planned.forEach(p => {
    const pIngs = recipeIngredientSet(p);
    pIngs.forEach(i => seenInPlanned.add(i));
  });
  recipeIngs.forEach(i => {
    if (seenInPlanned.has(i)) count += 1;
  });
  return count;
}

// Score a recipe by how well it uses the pantry
export function pantryScore(recipe, pantry) {
  if (!pantry || pantry.length === 0) return 0;
  const pantryKeys = pantry.map(p => ingredientKey(p.name)).filter(Boolean);
  const recipeIngs = recipeIngredientSet(recipe);
  let count = 0;
  recipeIngs.forEach(ing => {
    if (pantryKeys.some(p => ing.includes(p) && p.length > 2)) count += 1;
  });
  return count;
}


// ============================================================================
// INGREDIENT SWAP HELPERS
// ============================================================================
// When the user picks a substitute, we need to:
//   1. Update the ingredient object (name, qty, unit)
//   2. Update any step text that mentions the old ingredient name

// Generate the new ingredient object for the chosen substitute
export function buildSwappedIngredient(ingredient, substituteText) {
  // Generate a clean ingredient name from the substitute text.
  // "Equal parts: BBQ sauce + soy sauce + a pinch of Chinese five-spice" -> "BBQ sauce + soy sauce sub"
  // We take the first ingredient mentioned (before + or ,) and add "sub" if it's a compound swap.
  const isCompound = substituteText.includes('+') || substituteText.toLowerCase().includes('mix');
  let shortName;
  if (isCompound) {
    // Extract the first ingredient from the compound
    const first = substituteText
      .replace(/^(equal parts:|mix:?|combine:?)\s*/i, '')
      .split(/\s*[+,]\s*/)[0]
      .replace(/\s*\(.*?\)/g, '')
      .trim()
      .slice(0, 30);
    shortName = first + ' (sub for ' + (ingredient._swappedFrom || ingredient.name).split(' ')[0] + ')';
  } else {
    shortName = substituteText.split(' (')[0].split(',')[0].trim().slice(0, 50);
  }
  return {
    ...ingredient,
    name: shortName,
    _isSwapped: true,
    _swappedFrom: ingredient._swappedFrom || ingredient.name,
    _swappedTo: substituteText
  };
}

// Rewrite step text to replace old ingredient name with new one.
// Uses smart word-boundary replacement to avoid partial matches.
export function rewriteStepForSwap(stepText, oldName, newSubstituteText) {
  if (!stepText || !oldName) return stepText;
  
  // Build a clean short replacement label for use in step text
  const isCompound = newSubstituteText.includes('+') || newSubstituteText.toLowerCase().includes('mix');
  const replacement = isCompound
    ? '(your substitute)' // compound subs are described in ingredient list, not repeated in steps
    : newSubstituteText.split('(')[0].split(',')[0].trim().slice(0, 40);
  
  // Try progressively shorter matches to find something in the step text.
  // e.g. "hoisin sauce" → try "hoisin sauce", then "hoisin"
  const nameParts = oldName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
  
  let result = stepText;
  // Try full name first
  const candidates = [
    oldName,                              // "hoisin sauce"
    nameParts[0],                         // "hoisin"  
    nameParts.slice(0, -1).join(' '),     // drop last word: "hoisin sauce" → "hoisin"
    nameParts[nameParts.length - 1],      // last word: "sauce"
  ].filter((c, i, arr) => c && c.length > 2 && arr.indexOf(c) === i); // unique, >2 chars
  
  for (const candidate of candidates) {
    const escaped = candidate.replace(/[-()[\]{}*+?.,\^$|#\s]/g, '\$&');
    const re = new RegExp('\b' + escaped + '\b', 'gi');
    if (re.test(result)) {
      result = result.replace(re, replacement);
      break; // stop after first successful replacement
    }
  }
  
  return result;
}
