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

// Kitchen-friendly quantity rounding.
// Snaps scaled values to the nearest measurement a cook can actually use.
// Rules:
//   cups: snap to ⅛ cup increments (2 tbsp)
//   tbsp: snap to ½ tbsp or whole
//   tsp:  snap to ¼ tsp increments
//   g:    round to nearest 5g (or 10g above 100g)
//   ml:   round to nearest 5ml (or 25ml above 100ml)
//   unit counts: round to nearest whole (you can't have 1.5 eggs, use 2)

const FRAC_SYMBOLS = {
  0.125: '⅛', 0.25: '¼', 0.333: '⅓', 0.375: '⅜',
  0.5: '½', 0.625: '⅝', 0.667: '⅔', 0.75: '¾', 0.875: '⅞'
};
const FRAC_VALUES = Object.entries(FRAC_SYMBOLS).map(([v, s]) => [parseFloat(v), s]);

function snapToGrid(value, step) {
  return Math.round(value / step) * step;
}

function formatFraction(value) {
  if (value === 0) return '0';
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.01) return String(whole || 0);
  // Find nearest fraction symbol
  let best = null, bestDiff = 1;
  for (const [v, s] of FRAC_VALUES) {
    const diff = Math.abs(frac - v);
    if (diff < bestDiff) { bestDiff = diff; best = s; }
  }
  if (bestDiff < 0.04) {
    return whole > 0 ? `${whole}${best}` : best;
  }
  // Fallback to decimal for large values
  return value > 30 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, '');
}

export function formatQty(rawQ, unit) {
  const q = Number(rawQ);
  if (isNaN(q)) return String(rawQ);
  if (q === 0) return '0';

  const u = (unit || '').toLowerCase();

  // Grams — round to 5g below 200g, 10g above
  if (u === 'g') {
    const step = q >= 200 ? 10 : 5;
    return String(Math.round(snapToGrid(q, step)));
  }
  // Millilitres — round to 5ml below 100ml, 25ml above
  if (u === 'ml') {
    const step = q >= 100 ? 25 : 5;
    return String(Math.round(snapToGrid(q, step)));
  }
  // Kilograms / litres — 2 decimal max
  if (u === 'kg' || u === 'l') {
    return parseFloat(q.toFixed(2)).toString();
  }
  // Cups — try ⅓ increments first (⅓, ⅔), then snap to ⅛ (2 tbsp) increments
  if (u === 'cup' || u === 'cups') {
    // Check ⅓ and ⅔ first — these are common cup measures
    const third = q * 3;
    if (Math.abs(third - Math.round(third)) < 0.12) {
      return formatFraction(Math.round(third) / 3);
    }
    const snapped = snapToGrid(q, 0.125);
    return formatFraction(snapped);
  }
  // Tablespoons — snap to ½ tbsp
  if (u === 'tbsp' || u === 'tablespoon' || u === 'tablespoons') {
    const snapped = snapToGrid(q, 0.5);
    return formatFraction(snapped);
  }
  // Teaspoons — snap to ¼ tsp
  if (u === 'tsp' || u === 'teaspoon' || u === 'teaspoons') {
    const snapped = snapToGrid(q, 0.25);
    return formatFraction(snapped);
  }
  // Whole countable items (eggs, cloves, etc.) — round to nearest whole
  if (u === 'unit' || u === 'whole' || u === 'clove' || u === 'cloves' ||
      u === 'slice' || u === 'slices' || u === 'piece' || u === 'pieces' ||
      u === 'stalk' || u === 'sheet' || u === 'scoop') {
    return String(Math.round(q));
  }
  // Default — try fraction, fall back to decimal
  return formatFraction(q);
}

// Detect prep tasks across the week's recipes (consolidates "mince garlic" across multiple meals)
export function detectPrepTasks(weekPlan, recipes) {
  const tasks = {};
  weekPlan.forEach(w => {
    const r = recipes.find(x => x.id === w.recipe_id);
    if (!r) return;
    const scale = w.servings / r.servings;
    (r.ingredients || []).forEach(ing => {
      // Skip compound spice blends / sauces — their embedded breakdown
      // (e.g. "…¼ tsp ginger…") would otherwise trigger phantom fresh-prep
      // tasks with nonsensical (tbsp-of-dry-blend) quantities.
      if (parseCompoundComponents(ing.name)) return;
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

// ============================================================================
// FROM-SCRATCH BLEND EXPANSION
// ============================================================================
// Our recipes name compound components with their breakdown embedded in the
// name, e.g. "Moroccan spice blend (1 tsp cumin + ½ tsp paprika + …)" or
// "ginger sauce (3 tbsp soy + 1 tsp rice vinegar + …)". For a grocery list those
// opaque names are unbuyable and never match your pantry spices. These helpers
// parse the parenthetical into individual shoppable components.

const COMPONENT_UNITS = new Set([
  'tsp','teaspoon','teaspoons','tbsp','tablespoon','tablespoons','cup','cups',
  'g','gram','grams','kg','ml','l','oz','lb','clove','cloves','inch','stalk',
  'sprig','can','slice','slices','piece','pieces'
]);
const VAGUE_QTY = { pinch: 0.0625, dash: 0.0625, splash: 0.5, squeeze: 0.5, handful: 0.25 };

// Drop trailing method notes ("sugar, simmered 2 min" → "sugar") and leading
// prep adjectives grocery doesn't care about ("ground cumin" → "cumin"). Keeps
// distinguishing words like "smoked"/"toasted" that denote a different product.
function cleanComponentName(s) {
  let n = (s || '').split(',')[0].trim();
  n = n.replace(/^(ground|grated|minced|chopped|crushed|fresh|dried)\s+/i, '');
  return n.trim();
}

function parseComponentSegment(seg) {
  const s = seg.trim();
  const vague = s.match(/^(pinch|dash|splash|squeeze|handful)\s+(?:of\s+)?(.+)$/i);
  if (vague) return { qty: VAGUE_QTY[vague[1].toLowerCase()] ?? 0.125, unit: 'tsp', name: cleanComponentName(vague[2]) };
  const m = s.match(/^(\d+(?:\.\d+)?[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]?|[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s+(.+)$/);
  if (!m) return null;
  const qty = parseQty(m[1]);
  if (isNaN(qty)) return null;
  const words = m[2].trim().split(/\s+/);
  const firstWord = words[0].toLowerCase().replace(/\.$/, '');
  let unit = 'unit', rest = m[2].trim();
  if (COMPONENT_UNITS.has(firstWord)) { unit = normalizeUnit(firstWord); rest = words.slice(1).join(' '); }
  const name = cleanComponentName(rest);
  if (!name) return null;
  return { qty, unit, name };
}

// If an ingredient name embeds a "+"-separated breakdown, return its components;
// otherwise null (the name is a plain ingredient or a non-breakdown note).
export function parseCompoundComponents(name) {
  if (!name) return null;
  const m = name.match(/\(([^()]*\+[^()]*)\)/);
  if (!m) return null;
  const inner = m[1].replace(/^\s*made from\s+/i, '');
  const segments = inner.split('+').map(s => s.trim()).filter(Boolean);
  if (segments.length < 2) return null;
  const parts = [];
  for (const seg of segments) {
    const c = parseComponentSegment(seg);
    if (!c) return null; // not a clean breakdown — leave the ingredient intact
    parts.push(c);
  }
  return parts;
}

// Expand one recipe ingredient into shoppable line items. A from-scratch blend
// becomes its component spices/liquids; everything else passes through unchanged.
export function expandIngredient(ing) {
  const comps = parseCompoundComponents(ing.name);
  if (comps) return comps.map(c => ({ qty: c.qty, unit: c.unit, name: c.name, protein: false, fromBlend: ing.name }));
  return [{ qty: ing.qty || 0, unit: ing.unit, name: ing.name, protein: !!ing.protein }];
}

export function aggregateWeeklyIngredients(weekPlan, recipes) {
  const map = {};
  weekPlan.forEach(w => {
    const r = recipes.find(x => x.id === w.recipe_id);
    if (!r) return;
    const scale = w.servings / r.servings;
    (r.ingredients || []).forEach(ing => {
      expandIngredient(ing).forEach(comp => {
        const unit = normalizeUnit(comp.unit);
        const key = foldName(comp.name) + '|' + unit;
        if (!map[key]) {
          map[key] = { name: comp.name, unit, qty: 0, sources: [], protein: !!comp.protein };
        }
        map[key].qty += (comp.qty || 0) * scale;
        map[key].sources.push({ recipeId: r.id, recipeTitle: r.title });
      });
    });
  });
  return Object.values(map);
}

// ============================================================================
// PANTRY MATCHING + UNIT CONVERSION
// ============================================================================

// Convert a quantity between units of the SAME dimension (volume or mass).
// Returns null when the units are incompatible (e.g. tsp↔g) or unknown, or
// between two different count units (clove↔unit) which have no fixed ratio.
const UNIT_DIMENSION = {
  tsp: 'v', tbsp: 'v', cup: 'v', ml: 'v', l: 'v',
  g: 'm', kg: 'm', oz: 'm', lb: 'm',
};
const UNIT_TO_BASE = { // volume → ml, mass → g
  tsp: 4.92892, tbsp: 14.7868, cup: 236.588, ml: 1, l: 1000,
  g: 1, kg: 1000, oz: 28.3495, lb: 453.592,
};
export function convertQty(qty, fromUnit, toUnit) {
  const f = normalizeUnit(fromUnit), t = normalizeUnit(toUnit);
  if (f === t) return qty;
  const df = UNIT_DIMENSION[f], dt = UNIT_DIMENSION[t];
  if (!df || df !== dt) return null;
  return qty * UNIT_TO_BASE[f] / UNIT_TO_BASE[t];
}

// Whole-container units — if you keep an item by the jar/bag/bottle we can't
// convert to a recipe's tsp/g, but owning one means you're covered.
const CONTAINER_UNITS = new Set([
  'unit', 'piece', 'can', 'jar', 'bottle', 'bag', 'box', 'pack', 'package',
  'bunch', 'head', 'stalk', 'sprig', 'sheet', 'scoop',
]);

const PANTRY_SYNONYMS = {
  paste: ['puree', 'purée', 'concentrate'],
  puree: ['paste', 'purée'],
  garlic: ['garlic clove', 'clove garlic', 'garlic bulb'],
  ginger: ['ginger root', 'fresh ginger'],
  lemongrass: ['lemon grass', 'lemon-grass'],
};

// Strict-ish name match for pantry: exact folded name, or a known synonym
// equivalence. Deliberately NOT loose substring — for a grocery list a false
// "you already have it" (under-buy) is worse than listing an extra item, so we
// avoid "salt" matching "garlic salt".
export function pantryNameMatch(a, b) {
  const na = foldName(a), nb = foldName(b);
  if (na === nb) return true;
  for (const [key, syns] of Object.entries(PANTRY_SYNONYMS)) {
    const aKey = na.includes(key), bKey = nb.includes(key);
    if (aKey && (bKey || syns.some(s => nb.includes(s)))) return true;
    if (bKey && (aKey || syns.some(s => na.includes(s)))) return true;
  }
  return false;
}

export function computeGroceryList(weeklyIngredients, pantry) {
  return weeklyIngredients.map(item => {
    const iUnit = normalizeUnit(item.unit);
    const match = (pantry || []).find(p => Number(p.qty) > 0 && pantryNameMatch(p.name, item.name));
    if (!match) return { ...item, have: 0, need: item.qty, hasInPantry: false };

    const pUnit = normalizeUnit(match.unit);
    const converted = convertQty(Number(match.qty), pUnit, iUnit);
    if (converted != null) {
      // Same/compatible units (g↔kg, tsp↔tbsp↔cup, ml↔l) — subtract precisely.
      const have = converted;
      return { ...item, have, need: Math.max(0, item.qty - have), hasInPantry: true };
    }
    if (CONTAINER_UNITS.has(pUnit)) {
      // You keep a whole jar/bag of it — assume covered (owned spices drop off).
      return { ...item, have: item.qty, need: 0, hasInPantry: true, assumedCovered: true };
    }
    // Measured but incompatible dimension (e.g. pantry cups vs recipe grams) —
    // can't compare safely, so list the full amount rather than guess.
    return { ...item, have: 0, need: item.qty, hasInPantry: true };
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

function formatScaledQty(value, originalText, unitHint) {
  // Use the same kitchen-smart rounding as formatQty
  return formatQty(value, unitHint);
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
    return `${formatScaledQty(scaled, qtyStr, unit)} ${unit}`;
  });
}
