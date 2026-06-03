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
  },

  // === Proteins ===
  { matches: ['chicken breast', 'chicken thigh', 'boneless skinless chicken', 'ground chicken'], label: 'chicken',
    substitutes: [
      { type: 'replace', text: 'Turkey thighs or breast — same cook time, leaner', healthier: true },
      { type: 'vegan', text: 'Extra-firm tofu pressed dry — marinate 30 min, same seasoning', healthier: true }
    ]
  },
  { matches: ['salmon fillet', 'salmon'], label: 'salmon',
    substitutes: [
      { type: 'replace', text: 'Any firm white fish (cod, halibut, tilapia) — reduce cook time by 2 min', healthier: false },
      { type: 'replace', text: 'Chicken breast pounded thin — same cook time', healthier: false }
    ]
  },
  { matches: ['ground turkey'], label: 'ground turkey',
    substitutes: [
      { type: 'replace', text: 'Ground chicken — identical cook', healthier: false },
      { type: 'replace', text: 'Ground beef (80/20) — richer flavour', healthier: false }
    ]
  },

  // === Aromatics ===
  { matches: ['garlic clove', 'garlic'], howToMake: '1 clove = 1 tsp garlic paste = ¼ tsp garlic powder.', label: 'fresh garlic',
    substitutes: [
      { type: 'replace', text: '1 tsp garlic paste (jarred) per clove — skip the mincing', healthier: false },
      { type: 'replace', text: '¼ tsp garlic powder per clove — works in cooked dishes', healthier: false }
    ]
  },
  { matches: ['fresh ginger', 'ginger root', 'ginger'], howToMake: '1 inch fresh = 1 tbsp ginger paste = ¼ tsp ground ginger.', label: 'fresh ginger',
    substitutes: [
      { type: 'replace', text: '1 tbsp ginger paste (Gourmet Garden) per 1-inch piece', healthier: false },
      { type: 'replace', text: '¼ tsp ground ginger per 1-inch piece — less bright', healthier: false }
    ]
  },
  { matches: ['ginger-garlic puree', 'ginger garlic paste'], howToMake: '2 tbsp puree = 2 tbsp jarred ginger-garlic paste (exact 1:1).', label: 'ginger-garlic puree',
    substitutes: [
      { type: 'replace', text: '2 tbsp jarred ginger-garlic paste — exact 1:1 replacement', healthier: false },
      { type: 'replace', text: '1 tbsp ginger paste + 1 tbsp garlic paste mixed', healthier: false }
    ]
  },
  { matches: ['shallot'], label: 'shallot',
    substitutes: [
      { type: 'replace', text: 'Half a small white or red onion — use ½ the amount', healthier: false }
    ]
  },
  { matches: ['yellow onion', 'white onion', 'red onion'], label: 'onion',
    substitutes: [
      { type: 'replace', text: 'Any onion colour — red/yellow/white are interchangeable here', healthier: false },
      { type: 'replace', text: 'Leek (white and light green part) — milder and sweeter', healthier: false }
    ]
  },

  // === Grains ===
  { matches: ['jasmine rice', 'basmati rice', 'white rice', 'parboiled rice', 'long-grain'], label: 'white rice',
    substitutes: [
      { type: 'healthier', text: 'Brown rice — add 10-15 min to cook time (or use quick-cook)', healthier: true },
      { type: 'replace', text: 'Quinoa — same water ratio, 15 min cook, extra protein', healthier: true },
      { type: 'healthier', text: 'Cauliflower rice — heat in pan 5 min, no carbs', healthier: true }
    ]
  },
  { matches: ['bulgur wheat', 'bulgur'], label: 'bulgur',
    substitutes: [
      { type: 'replace', text: 'Quinoa — same prep (pour boiling water, cover 15 min)', healthier: false },
      { type: 'replace', text: 'Pearl couscous — faster (boiling water, cover 5 min)', healthier: false }
    ]
  },
  { matches: ['pearl couscous', 'israeli couscous'], label: 'pearl couscous',
    substitutes: [
      { type: 'replace', text: 'Orzo pasta — same shape, cook in boiling salted water 8 min', healthier: false }
    ]
  },
  { matches: ['orzo'], label: 'orzo',
    substitutes: [
      { type: 'replace', text: 'Any small pasta shape (ditalini, small shells)', healthier: false }
    ]
  },
  { matches: ['linguine', 'spaghetti'], label: 'long pasta',
    substitutes: [
      { type: 'replace', text: 'Any long pasta shape — fettuccine, bucatini, spaghetti', healthier: false },
      { type: 'healthier', text: 'Zucchini noodles spiralized — toss with hot sauce, no cook needed', healthier: true }
    ]
  },

  // === Vegetables ===
  { matches: ['bell pepper', 'sweet bell pepper', 'red bell pepper', 'green bell pepper'], label: 'bell pepper',
    substitutes: [
      { type: 'replace', text: 'Any bell pepper colour — flavour varies slightly but all work', healthier: false }
    ]
  },
  { matches: ['zucchini'], label: 'zucchini',
    substitutes: [
      { type: 'replace', text: 'Yellow summer squash — identical cook', healthier: false },
      { type: 'replace', text: 'Eggplant same size — 2 min extra cook time', healthier: false }
    ]
  },
  { matches: ['broccoli'], label: 'broccoli',
    substitutes: [
      { type: 'replace', text: 'Cauliflower florets — same roast time', healthier: false },
      { type: 'replace', text: 'Green beans — 2-3 min less roast time needed', healthier: false }
    ]
  },
  { matches: ['baby spinach', 'spinach'], label: 'spinach',
    substitutes: [
      { type: 'replace', text: 'Baby kale — slightly chewier, wilts the same', healthier: false }
    ]
  },
  { matches: ['bok choy', 'shanghai bok choy'], label: 'bok choy',
    substitutes: [
      { type: 'replace', text: 'Napa cabbage — works the same in stir-fries', healthier: false }
    ]
  },
  { matches: ['carrot'], label: 'carrot',
    substitutes: [
      { type: 'replace', text: 'Parsnip — sweeter but same texture when cooked', healthier: false },
      { type: 'replace', text: 'Skip it — carrots are usually just texture and colour', healthier: false }
    ]
  },
  { matches: ['green cabbage', 'red cabbage', 'coleslaw mix', 'pre-shredded coleslaw'], label: 'cabbage',
    substitutes: [
      { type: 'replace', text: 'Pre-shredded coleslaw bag from produce — saves 5 min', healthier: false },
      { type: 'replace', text: 'Napa cabbage — more tender, less cooking needed', healthier: false }
    ]
  },
  { matches: ['russet potato', 'yellow potato', 'yukon gold'], label: 'potato',
    substitutes: [
      { type: 'replace', text: 'Sweet potato — 5 min less roast time, more fibre', healthier: true },
      { type: 'replace', text: 'Any potato variety — roast times are identical', healthier: false }
    ]
  },
  { matches: ['snow peas', 'sugar snap peas'], label: 'snow peas',
    substitutes: [
      { type: 'replace', text: 'Snap peas and snow peas are interchangeable', healthier: false }
    ]
  },
  { matches: ['chickpea', 'can chickpeas', 'canned chickpeas'], label: 'chickpeas',
    substitutes: [
      { type: 'replace', text: 'Canned white beans (cannellini) — same texture', healthier: false },
      { type: 'replace', text: 'Canned lentils — slightly softer, works in stews', healthier: true }
    ]
  },

  // === Dairy / Fats ===
  { matches: ['greek yogurt', 'plain greek yogurt', 'full fat greek yogurt'], label: 'Greek yogurt',
    substitutes: [
      { type: 'replace', text: 'Full-fat sour cream — same texture and tang', healthier: false },
      { type: 'vegan', text: 'Plain coconut yogurt — same use in sauces', healthier: false }
    ]
  },
  { matches: ['olive oil'], label: 'olive oil',
    substitutes: [
      { type: 'replace', text: 'Any neutral oil (canola, avocado, vegetable) — identical for cooking', healthier: false }
    ]
  },
  { matches: ['butter'], label: 'butter',
    substitutes: [
      { type: 'replace', text: 'Olive oil — use ¾ the amount called for', healthier: false },
      { type: 'vegan', text: 'Vegan butter (same amount)', healthier: false }
    ]
  },

  // === Condiments / Pantry ===
  { matches: ['garlic salt'], howToMake: '1 tsp garlic salt = ¾ tsp coarse salt + ¼ tsp garlic powder.', label: 'garlic salt',
    substitutes: [
      { type: 'replace', text: '¾ tsp coarse salt + ¼ tsp garlic powder per 1 tsp garlic salt', healthier: false }
    ]
  },
  { matches: ['tomato paste'], label: 'tomato paste',
    substitutes: [
      { type: 'replace', text: '3 tbsp tomato sauce reduced = 1 tbsp paste', healthier: false },
      { type: 'replace', text: 'Sun-dried tomato paste in a tube — more intense flavour', healthier: false }
    ]
  },
  { matches: ['sesame oil', 'toasted sesame oil'], label: 'sesame oil',
    substitutes: [
      { type: 'replace', text: 'Skip it — sesame oil adds flavour but is not structural to the dish', healthier: false }
    ]
  },
  { matches: ['honey'], label: 'honey',
    substitutes: [
      { type: 'replace', text: 'Maple syrup — 1:1, slightly different but works in glazes', healthier: false },
      { type: 'replace', text: 'Brown sugar + splash of water to make it syrupy', healthier: false }
    ]
  },
  { matches: ['spicy mayo', 'kewpie'], howToMake: '2 tbsp mayo + 1 tsp sriracha + ½ tsp lime juice.', label: 'spicy mayo',
    substitutes: [
      { type: 'replace', text: 'Regular mayo + sriracha to taste + squeeze of lime', healthier: false },
      { type: 'healthier', text: 'Greek yogurt + sriracha + lime juice — much lighter', healthier: true }
    ]
  },
  { matches: ['basil pesto'], label: 'basil pesto',
    substitutes: [
      { type: 'replace', text: 'Any jarred pesto variety (sun-dried tomato, etc.)', healthier: false }
    ]
  },
  { matches: ['ranch dressing'], label: 'ranch dressing',
    substitutes: [
      { type: 'healthier', text: 'Greek yogurt + dried dill + garlic powder + lemon juice + salt', healthier: true }
    ]
  },
  { matches: ['piri piri', 'piri-piri'], label: 'piri piri sauce',
    substitutes: [
      { type: 'replace', text: '1 tbsp sriracha + 1 tbsp red wine vinegar + ½ tsp smoked paprika', healthier: false }
    ]
  },
  { matches: ['tikka sauce', 'tikka masala sauce'], howToMake: 'Mix: ¼ cup tomato paste + ¼ cup cream + 1 tsp garam masala + ¼ tsp salt, simmer 2 min.', label: 'tikka sauce',
    substitutes: [
      { type: 'replace', text: '¼ cup tomato paste + ¼ cup heavy cream + 1 tsp garam masala', healthier: false },
      { type: 'replace', text: 'Any jarred butter chicken or tikka masala sauce', healthier: false }
    ]
  },
  { matches: ['nuoc cham'], howToMake: 'Mix: 3 tbsp fish sauce + 3 tbsp water + 2 tbsp lime juice + 2 tbsp sugar + 1 garlic clove grated.', label: 'nuoc cham',
    substitutes: [
      { type: 'replace', text: 'Mix: fish sauce + lime juice + sugar + garlic + water (3:2:2:1:3)', healthier: false }
    ]
  },

  // === Fresh herbs ===
  { matches: ['fresh cilantro', 'cilantro'], label: 'fresh cilantro',
    substitutes: [
      { type: 'replace', text: 'Fresh flat-leaf parsley — adds freshness without cilantro flavour', healthier: false },
      { type: 'replace', text: 'Skip it — cilantro is garnish in most of these recipes', healthier: false }
    ]
  },
  { matches: ['fresh parsley', 'parsley'], label: 'fresh parsley',
    substitutes: [
      { type: 'replace', text: 'Fresh cilantro — same role as a fresh herb garnish', healthier: false },
      { type: 'replace', text: 'Skip it or use ½ tsp dried parsley', healthier: false }
    ]
  },

  // === Bread / Wraps ===
  { matches: ['naan', 'flatbread', 'naan-style'], label: 'naan',
    substitutes: [
      { type: 'replace', text: 'Pita bread — slightly thinner, crisps faster (check at 5 min)', healthier: false },
      { type: 'replace', text: 'Flour tortilla — very thin, will crisp in 3-4 min', healthier: false }
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
  // Special case: restoring to original (substituteText is the original ingredient name)
  const isRestoring = ingredient._swappedFrom && substituteText === ingredient._swappedFrom;
  if (isRestoring) {
    return { ...ingredient, name: substituteText, _swappedFrom: undefined, _swappedTo: undefined, _isSwapped: false };
  }
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

  // If restoring original (substituteText IS the original name), just do a simple swap back
  const isCompound = newSubstituteText.includes('+') || newSubstituteText.toLowerCase().startsWith('mix');
  const replacement = isCompound
    ? '(your substitute)' // compound subs described in ingredient list
    : newSubstituteText.split('(')[0].split(',')[0].trim().slice(0, 40);

  // Don't rewrite step text for "Skip it" substitutes
  if (replacement.toLowerCase().startsWith('skip')) return stepText;

  // Build candidates from most-specific to least-specific
  // e.g. "hoisin sauce" → ["hoisin sauce", "hoisin"]
  // e.g. "boneless skinless chicken breasts" → ["chicken breasts", "chicken"]
  const parts = oldName.trim().split(/\s+/);
  const candidates = [];
  // Full name
  candidates.push(oldName.trim());
  // Skip leading adjectives (boneless, skinless, fresh, dried, etc.)
  const adjectives = new Set(['boneless','skinless','fresh','dried','frozen','canned','jarred','ground','extra-firm','firm','soft','plain','full-fat','low-fat','large','small','medium','baby','mini','whole']);
  const contentParts = parts.filter(p => !adjectives.has(p.toLowerCase()));
  if (contentParts.length < parts.length && contentParts.length > 0) {
    candidates.push(contentParts.join(' '));
    candidates.push(contentParts[0]);
  }
  // All words except last (for names like "hoisin sauce" → "hoisin")
  if (parts.length > 1) candidates.push(parts.slice(0, -1).join(' '));
  // First word only
  if (parts.length > 1) candidates.push(parts[0]);
  // Last meaningful word (for "chicken breasts" → "chicken" or "breasts")
  const lastWord = contentParts[contentParts.length - 1] || parts[parts.length - 1];
  if (lastWord && lastWord !== parts[0]) candidates.push(lastWord);
  // Deduplicate
  const seen = new Set();
  const unique = candidates.filter(c => {
    if (!c || c.length < 3 || seen.has(c.toLowerCase())) return false;
    seen.add(c.toLowerCase());
    return true;
  });

  let result = stepText;
  for (const candidate of unique) {
    // Escape special regex chars properly
    const esc = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const re = new RegExp('(?<![a-zA-Z])' + esc + '(?![a-zA-Z])', 'gi');
      if (re.test(result)) {
        result = result.replace(new RegExp('(?<![a-zA-Z])' + esc + '(?![a-zA-Z])', 'gi'), replacement);
        break;
      }
    } catch {
      // lookbehind not supported — fall back to simple replace
      const simple = new RegExp(esc, 'gi');
      if (simple.test(result)) {
        result = result.replace(simple, replacement);
        break;
      }
    }
  }

  return result;
}

