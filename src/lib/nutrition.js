// Rough nutrition estimates per recipe, PER SERVING.
// These are ballpark numbers calculated from ingredient lists — accurate to ±15%.
// Good enough for meal planning, NOT for precise diet tracking.

export const NUTRITION = {
  hf_001: { calories: 620, protein: 28, carbs: 72, fat: 22 }, // Beef Spring Roll Bowls
  hf_002: { calories: 540, protein: 48, carbs: 38, fat: 22 }, // Moroccan Chicken
  hf_003: { calories: 580, protein: 42, carbs: 56, fat: 20 }, // Peruvian Chicken & Lime Rice
  hf_004: { calories: 590, protein: 38, carbs: 64, fat: 22 }, // Chili-Garlic Salmon
  hf_005: { calories: 620, protein: 40, carbs: 58, fat: 24 }, // Piri Piri Chicken
  hf_006: { calories: 650, protein: 30, carbs: 70, fat: 26 }, // Korean Beef Bowls
  hf_007: { calories: 510, protein: 36, carbs: 42, fat: 22 }, // Moroccan Poached Salmon
  hf_008: { calories: 580, protein: 46, carbs: 58, fat: 18 }, // Chicken Gyro Bowls
  hf_009: { calories: 540, protein: 42, carbs: 60, fat: 16 }, // Indian Vindaloo
  hf_010: { calories: 580, protein: 32, carbs: 64, fat: 22 }, // Tex-Mex Turkey Chili
  hf_011: { calories: 640, protein: 44, carbs: 56, fat: 26 }, // Smoky Dry-Rub Chicken
  hf_012: { calories: 620, protein: 38, carbs: 72, fat: 18 }, // Vietnamese Lemongrass
  hf_013: { calories: 600, protein: 40, carbs: 62, fat: 20 }, // Kung Pao Chicken
  hf_014: { calories: 540, protein: 36, carbs: 50, fat: 22 }, // Mango-Glazed Salmon
  hf_015: { calories: 620, protein: 36, carbs: 60, fat: 26 }, // Bang Bang Salmon
  hf_016: { calories: 680, protein: 38, carbs: 70, fat: 26 }, // Fajita Flatbread Pizza
  hf_017: { calories: 620, protein: 32, carbs: 78, fat: 18 }, // Honey-Garlic Turkey Noodles
  hf_018: { calories: 580, protein: 36, carbs: 62, fat: 22 }, // Pesto Salmon Couscous
  hf_019: { calories: 660, protein: 34, carbs: 66, fat: 28 }, // Tex-Mex Beef Orzo
  hf_020: { calories: 560, protein: 42, carbs: 60, fat: 16 }  // Honey-Glazed Chicken
};

export function getNutrition(recipeId) {
  return NUTRITION[recipeId] || null;
}

// Pull primary protein from ingredients (used for filters)
export function getPrimaryProtein(recipe) {
  const proteinIng = (recipe.ingredients || []).find(i => i.protein);
  if (!proteinIng) return 'vegetarian';
  const name = proteinIng.name.toLowerCase();
  if (name.includes('chicken')) return 'chicken';
  if (name.includes('beef') || name.includes('steak')) return 'beef';
  if (name.includes('turkey')) return 'turkey';
  if (name.includes('salmon') || name.includes('fish')) return 'salmon';
  if (name.includes('shrimp')) return 'seafood';
  if (name.includes('pork')) return 'pork';
  if (name.includes('tofu') || name.includes('tempeh')) return 'vegetarian';
  return 'other';
}
