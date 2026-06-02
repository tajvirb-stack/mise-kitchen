// Recipe variant helpers — used by the UI to swap step text/ingredient quantities
// when the user toggles between cooking methods or fresh vs. paste ingredients.

// ============================================================================
// EQUIPMENT MODES
// ============================================================================
// A step's `equipment` array lists which methods it supports. If a step has
// `airFryerAlt` or `stovetopAlt` text, those override the main text when the
// user has selected that mode.

export const EQUIPMENT_MODES = {
  oven: { id: 'oven', label: 'Oven', icon: '🔥', shortLabel: 'oven' },
  airFryer: { id: 'airFryer', label: 'Air fryer', icon: '🌪️', shortLabel: 'air fryer' },
  stovetop: { id: 'stovetop', label: 'Stovetop', icon: '🍳', shortLabel: 'stovetop' }
};

// Return the step text + timer for the current equipment mode.
// Falls back to main text if the mode isn't supported by this step.
export function resolveStep(step, mode) {
  if (!step) return { text: '', timerSec: null };
  if (mode === 'airFryer' && step.airFryerAlt) {
    return {
      text: step.airFryerAlt.text,
      timerSec: step.airFryerAlt.timerSec ?? step.timerSec
    };
  }
  if (mode === 'stovetop' && step.stovetopAlt) {
    return {
      text: step.stovetopAlt.text,
      timerSec: step.stovetopAlt.timerSec ?? step.timerSec
    };
  }
  return { text: step.text, timerSec: step.timerSec };
}

// Determine which equipment modes this recipe supports.
// A mode is supported if AT LEAST ONE step has an alt for it,
// AND we always include 'oven' as the default mode for any recipe.
export function getSupportedEquipment(recipe) {
  if (!recipe?.steps) return ['oven'];
  const modes = new Set(['oven']);
  for (const step of recipe.steps) {
    if (step.airFryerAlt) modes.add('airFryer');
    if (step.stovetopAlt) modes.add('stovetop');
  }
  return Array.from(modes);
}

// ============================================================================
// INGREDIENT ALTERNATES (fresh vs paste, etc.)
// ============================================================================
// An ingredient can have `alternates`: an array of { name, qty, unit, modeId }.
// Each represents an alternative form, e.g. fresh garlic → garlic paste.
// The modeId groups all "use the paste version of everything" alternates.

export const INGREDIENT_MODES = {
  fresh: { id: 'fresh', label: 'Fresh', icon: '🌿', shortLabel: 'fresh' },
  paste: { id: 'paste', label: 'Jarred / paste', icon: '🥫', shortLabel: 'jarred' }
};

// Return the active form of an ingredient for the given mode.
// Default 'fresh' means: use the main name/qty/unit as written.
export function resolveIngredient(ing, mode) {
  if (!ing) return null;
  if (mode === 'fresh' || !ing.alternates) return ing;
  const alt = ing.alternates.find(a => a.modeId === mode);
  if (!alt) return ing;
  return { ...ing, name: alt.name, qty: alt.qty, unit: alt.unit, _isAlt: true };
}

// Does the recipe have any ingredients with alternates?
export function hasIngredientAlternates(recipe) {
  if (!recipe?.ingredients) return false;
  return recipe.ingredients.some(i => i.alternates && i.alternates.length > 0);
}

// ============================================================================
// STEP TEXT INGREDIENT-AWARE REWRITES
// ============================================================================
// When step text references "minced garlic" but the user has paste mode on,
// the step probably needs slightly different wording (skip the mincing).
// We support this via step.pasteAlt — same shape as airFryerAlt/stovetopAlt.

export function resolveStepForIngredientMode(step, ingredientMode) {
  if (!step) return null;
  if (ingredientMode === 'paste' && step.pasteAlt) {
    return { ...step, text: step.pasteAlt.text, timerSec: step.pasteAlt.timerSec ?? step.timerSec };
  }
  return step;
}

// Full resolver — apply both equipment AND ingredient mode
// IMPORTANT: step.userText is a user-applied swap that overrides ALL alts.
// Equipment and ingredient alts only apply when the user hasn't made a custom swap.
export function fullyResolveStep(step, equipmentMode, ingredientMode) {
  if (!step) return null;
  // User swap takes absolute priority — overrides equipment and ingredient alts
  if (step.userText) {
    return { ...step, text: step.userText };
  }
  // First apply ingredient mode (might change the text)
  let s = resolveStepForIngredientMode(step, ingredientMode);
  // Then apply equipment mode (might change the text again, e.g. for the cooking step)
  const eq = resolveStep(s, equipmentMode);
  return { ...s, text: eq.text, timerSec: eq.timerSec };
}
