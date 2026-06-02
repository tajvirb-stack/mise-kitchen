// Auto-calculate nutrition from ingredient list
// Per-100g values for common ingredients (USDA SR-Legacy averages)

const NUTRITION_DB = {
  // PROTEINS (per 100g raw)
  'chicken breast': { cal: 165, p: 31, f: 3.6, c: 0, fb: 0, na: 74 },
  'chicken thigh': { cal: 209, p: 26, f: 11, c: 0, fb: 0, na: 87 },
  'chicken thighs': { cal: 209, p: 26, f: 11, c: 0, fb: 0, na: 87 },
  'ground beef': { cal: 250, p: 26, f: 17, c: 0, fb: 0, na: 75 },
  'lean ground beef': { cal: 176, p: 27, f: 8, c: 0, fb: 0, na: 75 },
  'ground turkey': { cal: 167, p: 21, f: 8, c: 0, fb: 0, na: 78 },
  'extra lean ground turkey': { cal: 120, p: 23, f: 2, c: 0, fb: 0, na: 70 },
  'salmon': { cal: 208, p: 20, f: 13, c: 0, fb: 0, na: 59 },
  'salmon fillet': { cal: 208, p: 20, f: 13, c: 0, fb: 0, na: 59 },
  'turkey bacon': { cal: 226, p: 17, f: 16, c: 2, fb: 0, na: 1740, perStrip: 33 },
  'egg': { cal: 155, p: 13, f: 11, c: 1.1, fb: 0, na: 124, perUnit: 50 },
  'egg whites': { cal: 52, p: 11, f: 0.2, c: 0.7, fb: 0, na: 166 },
  'liquid egg whites': { cal: 52, p: 11, f: 0.2, c: 0.7, fb: 0, na: 166 },
  'feta': { cal: 264, p: 14, f: 21, c: 4, fb: 0, na: 917 },
  'parmesan': { cal: 392, p: 36, f: 26, c: 3, fb: 0, na: 1529 },
  'cottage cheese': { cal: 98, p: 11, f: 4, c: 3, fb: 0, na: 364 },
  'greek yogurt': { cal: 73, p: 10, f: 1.9, c: 4, fb: 0, na: 36 },

  // CARBS / GRAINS
  'rolled oats': { cal: 389, p: 17, f: 7, c: 66, fb: 11, na: 2 },
  'jasmine rice': { cal: 365, p: 7, f: 0.7, c: 80, fb: 1, na: 5 },
  'basmati rice': { cal: 360, p: 7, f: 0.5, c: 78, fb: 1, na: 5 },
  'brown rice': { cal: 370, p: 8, f: 3, c: 77, fb: 4, na: 7 },
  'couscous': { cal: 376, p: 13, f: 0.6, c: 77, fb: 5, na: 10 },
  'orzo': { cal: 365, p: 13, f: 1.5, c: 73, fb: 3, na: 9 },
  'noodles': { cal: 138, p: 5, f: 2, c: 25, fb: 1, na: 6 },
  'pasta': { cal: 131, p: 5, f: 1.1, c: 25, fb: 1.8, na: 6 },
  'flatbread': { cal: 280, p: 9, f: 5, c: 50, fb: 3, na: 600, perUnit: 90 },
  'keto wrap': { cal: 120, p: 5, f: 4, c: 16, fb: 17, na: 460, perUnit: 50 },
  'high-fiber keto wrap': { cal: 120, p: 5, f: 4, c: 16, fb: 17, na: 460, perUnit: 50 },
  'hash brown': { cal: 218, p: 3, f: 13, c: 23, fb: 2, na: 280, perUnit: 60 },
  'sweet potato': { cal: 86, p: 1.6, f: 0.1, c: 20, fb: 3, na: 55 },
  'potato': { cal: 77, p: 2, f: 0.1, c: 17, fb: 2.2, na: 6 },

  // VEGETABLES
  'spinach': { cal: 23, p: 2.9, f: 0.4, c: 3.6, fb: 2.2, na: 79 },
  'baby spinach': { cal: 23, p: 2.9, f: 0.4, c: 3.6, fb: 2.2, na: 79 },
  'zucchini': { cal: 17, p: 1.2, f: 0.3, c: 3.1, fb: 1, na: 8 },
  'bell pepper': { cal: 31, p: 1, f: 0.3, c: 6, fb: 2.1, na: 4 },
  'onion': { cal: 40, p: 1.1, f: 0.1, c: 9.3, fb: 1.7, na: 4 },
  'garlic': { cal: 149, p: 6.4, f: 0.5, c: 33, fb: 2.1, na: 17 },
  'cucumber': { cal: 16, p: 0.7, f: 0.1, c: 3.6, fb: 0.5, na: 2 },
  'lettuce': { cal: 15, p: 1.4, f: 0.2, c: 2.9, fb: 1.3, na: 28 },
  'romaine': { cal: 17, p: 1.2, f: 0.3, c: 3.3, fb: 2.1, na: 8 },
  'broccoli': { cal: 34, p: 2.8, f: 0.4, c: 7, fb: 2.6, na: 33 },
  'edamame': { cal: 122, p: 11, f: 5, c: 10, fb: 5, na: 6 },
  'avocado': { cal: 160, p: 2, f: 15, c: 9, fb: 7, na: 7 },
  'carrot': { cal: 41, p: 0.9, f: 0.2, c: 9.6, fb: 2.8, na: 69 },

  // LEGUMES / BEANS
  'chickpeas': { cal: 164, p: 9, f: 2.6, c: 27, fb: 8, na: 7 },
  'black beans': { cal: 132, p: 9, f: 0.5, c: 24, fb: 9, na: 1 },
  'white beans': { cal: 139, p: 9, f: 0.4, c: 25, fb: 11, na: 6 },

  // FATS & OILS
  'olive oil': { cal: 884, p: 0, f: 100, c: 0, fb: 0, na: 2 },
  'sesame oil': { cal: 884, p: 0, f: 100, c: 0, fb: 0, na: 0 },
  'butter': { cal: 717, p: 0.9, f: 81, c: 0.1, fb: 0, na: 11 },

  // SAUCES
  'soy sauce': { cal: 53, p: 8, f: 0.6, c: 4.9, fb: 0.8, na: 5493 },
  'sriracha': { cal: 93, p: 1.9, f: 0.9, c: 19, fb: 2, na: 2124 },
  'gochujang': { cal: 218, p: 5, f: 1, c: 49, fb: 2, na: 3270 },
  'pesto': { cal: 418, p: 5, f: 41, c: 5, fb: 1, na: 760 },
  'salsa verde': { cal: 41, p: 1.5, f: 0.4, c: 8.4, fb: 1.6, na: 593 },
  'buffalo sauce': { cal: 30, p: 0.5, f: 1, c: 5, fb: 0.5, na: 4000 },
  'ranch': { cal: 200, p: 1, f: 22, c: 2, fb: 0, na: 940 },
  'mayo': { cal: 680, p: 1, f: 75, c: 0.6, fb: 0, na: 635 },
  'light mayo': { cal: 240, p: 1, f: 24, c: 4, fb: 0, na: 760 },
  'tzatziki': { cal: 84, p: 4, f: 6, c: 4, fb: 0, na: 250 },

  // DAIRY ALT
  'almond milk': { cal: 17, p: 0.6, f: 1.5, c: 0.6, fb: 0.4, na: 63 },
  'coconut milk': { cal: 230, p: 2.3, f: 24, c: 6, fb: 2, na: 15 },

  // POWDERS / OTHER
  'whey isolate': { cal: 380, p: 88, f: 4, c: 5, fb: 0, na: 200 },
  'whey protein': { cal: 380, p: 80, f: 5, c: 8, fb: 0, na: 200 },
  'protein powder': { cal: 380, p: 80, f: 5, c: 8, fb: 0, na: 200 },
  'chia seeds': { cal: 486, p: 17, f: 31, c: 42, fb: 34, na: 16 },
  'honey': { cal: 304, p: 0.3, f: 0, c: 82, fb: 0.2, na: 4 },
  'kalamata olives': { cal: 115, p: 0.8, f: 11, c: 6, fb: 3, na: 1556 },
  'olives': { cal: 115, p: 0.8, f: 11, c: 6, fb: 3, na: 1556 },
  'kimchi': { cal: 23, p: 1.7, f: 0.5, c: 3.4, fb: 1.6, na: 747 },
  'banana': { cal: 89, p: 1.1, f: 0.3, c: 23, fb: 2.6, na: 1, perUnit: 118 },
  'apple': { cal: 52, p: 0.3, f: 0.2, c: 14, fb: 2.4, na: 1, perUnit: 182 },
  'lemon': { cal: 29, p: 1.1, f: 0.3, c: 9, fb: 2.8, na: 2, perUnit: 84 },
  'peanuts': { cal: 567, p: 26, f: 49, c: 16, fb: 8.5, na: 18 },
  'sun-dried tomatoes': { cal: 258, p: 14, f: 3, c: 56, fb: 12, na: 2095 },
  'roasted red peppers': { cal: 28, p: 1, f: 0.2, c: 6, fb: 1.2, na: 380 },
};

// Convert ingredient amount to grams (best-effort)
function toGrams(ingredient) {
  const { qty = 1, unit = '', name = '' } = ingredient;
  const u = (unit || '').toLowerCase();
  const n = name.toLowerCase();

  // Volume to weight estimates
  if (u === 'g' || u === 'gram' || u === 'grams') return qty;
  if (u === 'kg') return qty * 1000;
  if (u === 'oz') return qty * 28.35;
  if (u === 'lb' || u === 'lbs') return qty * 453.6;
  if (u === 'cup' || u === 'cups') {
    if (n.includes('rice') || n.includes('oat') || n.includes('flour')) return qty * 180;
    if (n.includes('yogurt') || n.includes('milk') || n.includes('liquid')) return qty * 240;
    if (n.includes('spinach') || n.includes('greens') || n.includes('lettuce')) return qty * 30;
    if (n.includes('cottage') || n.includes('cheese')) return qty * 226;
    return qty * 240; // default liquid
  }
  if (u === 'tbsp' || u === 'tablespoon') return qty * 15;
  if (u === 'tsp' || u === 'teaspoon') return qty * 5;
  if (u === 'scoop') return qty * 32; // standard protein scoop
  if (u === 'sheet') return qty * 3; // nori
  if (u === 'clove') return qty * 3; // garlic
  if (u === 'pinch') return qty * 0.5;
  if (u === 'strip' || u === 'strips') {
    if (n.includes('bacon')) return qty * 15;
    return qty * 15;
  }
  if (u === 'slice' || u === 'slices') return qty * 10;
  if (u === 'stalk') return qty * 40;
  if (u === '' || u === 'unit') {
    // Look up per-unit weight from db
    const key = findKey(n);
    if (key && NUTRITION_DB[key]?.perUnit) return qty * NUTRITION_DB[key].perUnit;
    return qty * 100; // default
  }
  return qty * 100; // unknown unit fallback
}

function findKey(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  // Try exact match first
  if (NUTRITION_DB[n]) return n;
  // Try keys that appear as substrings (most specific first)
  const keys = Object.keys(NUTRITION_DB).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (n.includes(k)) return k;
  }
  return null;
}

export function computeNutritionFromIngredients(recipe) {
  if (!recipe?.ingredients?.length) return null;
  const servings = recipe.servings || 1;
  let total = { cal: 0, p: 0, f: 0, c: 0, fb: 0, na: 0 };
  let matched = 0;

  for (const ing of recipe.ingredients) {
    const key = findKey(ing.name);
    if (!key) continue;
    matched++;
    const grams = toGrams(ing);
    const nut = NUTRITION_DB[key];
    const factor = grams / 100;
    total.cal += nut.cal * factor;
    total.p += nut.p * factor;
    total.f += nut.f * factor;
    total.c += nut.c * factor;
    total.fb += nut.fb * factor;
    total.na += nut.na * factor;
  }

  // Per-serving
  return {
    calories: Math.round(total.cal / servings),
    protein: Math.round(total.p / servings),
    fat: Math.round(total.f / servings),
    carbs: Math.round(total.c / servings),
    fiber: Math.round(total.fb / servings),
    sodium: Math.round(total.na / servings),
    _matchedIngredients: matched,
    _totalIngredients: recipe.ingredients.length,
    _confidence: matched / recipe.ingredients.length,
  };
}
