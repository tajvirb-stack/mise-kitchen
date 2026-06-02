// Suggests yesterday's dinner as today's lunch if it's marked as leftover-friendly
// and had multiple servings.

export function suggestLeftoverLunch(weekPlan, currentDate, recipes) {
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().split('T')[0];

  // Find yesterday's dinner — adapt this to your weekPlan shape
  const yesterdayDinner = Array.isArray(weekPlan)
    ? weekPlan.find(p => p.day === yKey && p.mealSlot === 'dinner')
    : weekPlan[yKey]?.dinner;

  if (!yesterdayDinner) return null;

  const recipe = recipes.find(r => r.id === yesterdayDinner.recipeId);
  if (!recipe?.leftoverFriendly) return null;
  if ((recipe.servings || 1) < 2) return null;

  return {
    type: 'leftover',
    recipeId: recipe.id,
    title: `Leftover: ${recipe.title}`,
    nutrition: recipe.nutrition,
    note: "From yesterday's dinner",
  };
}
