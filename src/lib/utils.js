// Utility helpers — unit normalization, ingredient folding, prep-task detection

const UNIT_ALIASES = {
  'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
  'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
  'cup': 'cup', 'cups': 'cup',
  'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
  'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
  'g': 'g', 'gram': 'g', 'grams': 'g',
  'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
  'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
  'l': 'l', 'liter': 'l', 'liters': 'l',
  'clove': 'clove', 'cloves': 'clove',
  'piece': 'piece', 'pieces': 'piece',
  'unit': 'unit', 'units': 'unit', '': 'unit'
};

export function normalizeUnit(u) {
  if (!u) return 'unit';
  return UNIT_ALIASES[u.toLowerCase().trim()] || u.toLowerCase().trim();
}

export function normalizeIngredientName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// crude singular/plural folding for grocery dedup
export function foldName(name) {
  let n = normalizeIngredientName(name);
  n = n.replace(/^(fresh|dried|chopped|minced|diced|sliced|grated|shredded|crushed|whole)\s+/, '');
  if (n.endsWith('ies')) n = n.slice(0, -3) + 'y';
  else if (n.endsWith('es') && !n.endsWith('ses')) n = n.slice(0, -2);
  else if (n.endsWith('s') && !n.endsWith('ss')) n = n.slice(0, -1);
  return n;
}

export function formatQty(q) {
  if (q === Math.floor(q)) return String(q);
  const f = q - Math.floor(q);
  const fracs = [[0.25,'¼'],[0.5,'½'],[0.75,'¾'],[0.333,'⅓'],[0.667,'⅔']];
  for (const [v, sym] of fracs) {
    if (Math.abs(f - v) < 0.05) {
      const whole = Math.floor(q);
      return whole > 0 ? `${whole}${sym}` : sym;
    }
  }
  return q.toFixed(2).replace(/\.?0+$/, '');
}

// Detect prep tasks across the week's recipes (consolidates "mince garlic" across multiple meals)
export function detectPrepTasks(weekPlan, recipes) {
  const tasks = {};
  weekPlan.forEach(w => {
    const r = recipes.find(x => x.id === w.recipe_id);
    if (!r) return;
    const scale = w.servings / r.servings;
    (r.ingredients || []).forEach(ing => {
      const lower = (ing.name || '').toLowerCase();
      let prep = null;
      if (/\b(garlic|clove)\b/.test(lower)) prep = 'mince garlic';
      else if (/\bonion\b/.test(lower) && !/green onion/.test(lower)) prep = 'dice onions';
      else if (/\bcarrot\b/.test(lower)) prep = 'slice carrots';
      else if (/\bbroccoli\b/.test(lower)) prep = 'cut broccoli florets';
      else if (/\bbell pepper\b/.test(lower)) prep = 'slice bell peppers';
      else if (/\b(chicken|beef|pork)\b/.test(lower) && !/breast|fillet|ground/.test(lower)) prep = 'cube ' + lower;
      else if (/\bcilantro|parsley|basil|mint\b/.test(lower)) prep = 'chop fresh herbs';
      else if (/\bginger\b/.test(lower) && !/ginger-garlic/.test(lower)) prep = 'mince ginger';
      else if (/\b(lemon|lime)\b/.test(lower)) prep = 'zest & juice citrus';
      if (prep) {
        if (!tasks[prep]) tasks[prep] = { task: prep, totalQty: 0, unit: ing.unit, recipes: new Set() };
        tasks[prep].totalQty += (ing.qty || 0) * scale;
        tasks[prep].recipes.add(r.title);
      }
    });
  });
  return Object.values(tasks).map(t => ({ ...t, recipes: [...t.recipes] })).filter(t => t.recipes.length >= 1);
}

export function aggregateWeeklyIngredients(weekPlan, recipes) {
  const map = {};
  weekPlan.forEach(w => {
    const r = recipes.find(x => x.id === w.recipe_id);
    if (!r) return;
    const scale = w.servings / r.servings;
    (r.ingredients || []).forEach(ing => {
      const key = foldName(ing.name) + '|' + ing.unit;
      if (!map[key]) {
        map[key] = { name: ing.name, unit: ing.unit, qty: 0, sources: [], protein: !!ing.protein };
      }
      map[key].qty += (ing.qty || 0) * scale;
      map[key].sources.push({ recipeId: r.id, recipeTitle: r.title });
    });
  });
  return Object.values(map);
}

export function computeGroceryList(weeklyIngredients, pantry) {
  return weeklyIngredients.map(item => {
    const inPantry = pantry.find(p =>
      foldName(p.name) === foldName(item.name) && normalizeUnit(p.unit) === item.unit
    );
    const have = inPantry ? Number(inPantry.qty) : 0;
    const need = Math.max(0, item.qty - have);
    return { ...item, have, need, hasInPantry: !!inPantry };
  });
}

// ============================================================================
// SERVINGS SCALING — scales numeric quantities embedded in recipe step text
// ============================================================================

// Match patterns like "2 tbsp", "1.5 cups", "300 ml", "1¼ cups", "½ tsp", etc.
// Returns the scaled number formatted nicely.

const FRACTIONS_TO_DECIMAL = {
  '¼': 0.25, '½': 0.5, '¾': 0.75,
  '⅓': 0.333, '⅔': 0.667,
  '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
  '⅙': 0.167, '⅚': 0.833,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
};

function parseQty(str) {
  // Handle "1¼" or just "¼" or "1.5" or "300"
  const fracMatch = str.match(/^(\d+)?([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?$/);
  if (fracMatch) {
    const whole = fracMatch[1] ? parseInt(fracMatch[1]) : 0;
    const frac = fracMatch[2] ? FRACTIONS_TO_DECIMAL[fracMatch[2]] : 0;
    return whole + frac;
  }
  return parseFloat(str);
}

function formatScaledQty(value, originalText) {
  // For very small numbers, keep more precision
  if (value < 0.1) return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (value < 1) {
    // Try to express as fraction
    if (Math.abs(value - 0.25) < 0.02) return '¼';
    if (Math.abs(value - 0.5) < 0.02) return '½';
    if (Math.abs(value - 0.75) < 0.02) return '¾';
    if (Math.abs(value - 0.333) < 0.03) return '⅓';
    if (Math.abs(value - 0.667) < 0.03) return '⅔';
    if (Math.abs(value - 0.125) < 0.02) return '⅛';
    return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
  if (value === Math.floor(value)) return String(Math.round(value));
  // Mixed number
  const whole = Math.floor(value);
  const frac = value - whole;
  if (Math.abs(frac - 0.25) < 0.02) return `${whole}¼`;
  if (Math.abs(frac - 0.5) < 0.02) return `${whole}½`;
  if (Math.abs(frac - 0.75) < 0.02) return `${whole}¾`;
  if (Math.abs(frac - 0.333) < 0.03) return `${whole}⅓`;
  if (Math.abs(frac - 0.667) < 0.03) return `${whole}⅔`;
  // For larger numbers like 600.5 → 600
  if (value > 30) return String(Math.round(value));
  return value.toFixed(1).replace(/\.0$/, '');
}

// Scale numeric quantities mentioned in step text by `scale` (e.g. 1.5 = 1.5x).
// Looks for patterns like "2 tbsp", "300 ml", "1¼ cups", etc., and rewrites them.
export function scaleStepText(text, scale) {
  if (!text || scale === 1) return text;

  // Common units to recognize
  const unitPattern = '(?:tbsp|tablespoons?|tsp|teaspoons?|cups?|ml|milliliters?|l|liters?|g|grams?|kg|oz|ounces?|lb|pounds?|cm|inches?|cloves?|pieces?|whole)';

  // Match: optional whole number + optional fraction + space + unit
  // Examples: "2 tbsp", "1¼ cups", "300 ml", "½ tsp", "1.5 cups"
  const qtyRegex = new RegExp(
    `(\\d+(?:\\.\\d+)?[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]?|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\\s+(${unitPattern})\\b`,
    'gi'
  );

  return text.replace(qtyRegex, (match, qtyStr, unit) => {
    const value = parseQty(qtyStr);
    if (isNaN(value) || value <= 0) return match;
    const scaled = value * scale;
    return `${formatScaledQty(scaled, qtyStr)} ${unit}`;
  });
}
