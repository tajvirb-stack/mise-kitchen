// Protein classification for recipe filtering.
// (The old static NUTRITION table + getNutrition() were removed — recipe macros
//  now live on each recipe's `nutrition` field, keyed by DB id, not hf_* slugs.)

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
