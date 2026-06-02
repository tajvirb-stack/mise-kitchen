// step-format.js
// =====================================================
// Take a recipe step's prose text and convert it into:
//   1. A structured array of mini-actions ("bullets") for clean display
//   2. Highlighted spans for quantities, times, and temperatures
//
// This runs at render time so we don't have to manually re-author all 35 recipes.
// Existing custom recipes also benefit.

// Patterns to recognize as "highlightable" within a sentence:
//   - quantities: "1 tbsp", "½ cup", "¼ tsp", "2 cloves", "8 oz", "350g", "1¼ cups"
//   - times: "3 minutes", "5-7 min", "60 seconds", "30 sec", "8-10 min"
//   - temperatures: "450°F", "165°F", "medium-high heat", "medium heat", "low heat"
//   - oven verbs: "Preheat oven to 425°F"
const HIGHLIGHT_PATTERNS = [
  // Time ranges and durations
  /\b(\d+(?:\.\d+)?(?:[-–]\d+(?:\.\d+)?)?\s*(?:min|minutes?|sec|seconds?|hr|hours?))\b/gi,
  // Temperatures
  /\b(\d+\s*°\s*[FC]\b)/gi,
  // Heat levels
  /\b(medium-?high|medium-?low|high heat|medium heat|low heat|HIGH|MEDIUM|LOW)\b/g,
  // Internal temp targets ("reads 165°F" already covered above; this catches verb form)
  /\b(reads? \d+\s*°\s*[FC])\b/gi,
  // Quantities with units
  /\b(\d+(?:[¼½¾⅓⅔⅛⅜⅝⅞])?(?:\s*[-–]\s*\d+(?:[¼½¾⅓⅔⅛⅜⅝⅞])?)?\s*(?:tbsp|tablespoons?|tsp|teaspoons?|cups?|oz|lbs?|pounds?|grams?|g\b|kg|ml|l\b|cloves?|pinch|dash|inches?|"|inch)\b)/gi,
  // Bare fractions with units
  /\b([¼½¾⅓⅔⅛⅜⅝⅞]\s*(?:tbsp|tsp|cup|oz|lb|g|kg|ml|l|cloves?|inch)\b)/gi,
];

// Split a step's text into discrete sentence-level actions.
// We split on:
//   - Sentence terminators: ". " (period + space)
//   - Em-dash separators when they introduce a clarification ("about 3 minutes — keep stirring")
//     (we leave em-dashes alone if they appear mid-sentence; the period rule handles real breaks)
//
// Rules for joining:
//   - If a "sentence" ends in something like "Add 1 tbsp olive oil" and the next sentence
//     starts with "When the oil shimmers", they're related actions — we keep them separate
//     but order-preserved so the bullet list reads naturally.
//   - If a fragment is < 4 words, we merge it into the previous bullet (avoid orphan tiny bullets).
//
// Examples:
//   "In a small saucepan over medium heat, warm 1 tsp sesame oil. Add the rice and toast,
//    stirring constantly with a wooden spoon, until the grains are fragrant and lightly
//    golden — about 3 minutes."
//   →  [
//        "In a small saucepan over medium heat, warm 1 tsp sesame oil.",
//        "Add the rice and toast, stirring constantly with a wooden spoon, until the grains are fragrant and lightly golden — about 3 minutes."
//      ]
export function splitStepIntoBullets(text) {
  if (!text || typeof text !== 'string') return [];

  // First, normalize whitespace
  const clean = text.replace(/\s+/g, ' ').trim();

  // Sentence splitter that respects "Mr.", "Dr.", "vs.", "e.g.", etc.
  // Practical approach: split on ". " where the previous char isn't a digit (so "2.5 tbsp" doesn't split)
  // and the next char is a capital letter or starts with a number followed by a unit.
  const sentences = [];
  let buffer = '';
  for (let i = 0; i < clean.length; i++) {
    buffer += clean[i];
    // Look for sentence break: period + space + (capital letter or "When" or "Once")
    if (clean[i] === '.' && clean[i + 1] === ' ') {
      const next = clean[i + 2];
      const prev = clean[i - 1];
      // Don't split if previous char is a digit (e.g., "2.5")
      const prevIsDigit = /\d/.test(prev || '');
      // Don't split if previous chars form an abbreviation
      const lastWord = buffer.slice(-6).toLowerCase().trim();
      const isAbbrev = /\b(mr|dr|vs|eg|ie|st|e\.g|i\.e|approx|etc|oz|lb|tbsp|tsp|min|sec)$/.test(lastWord);
      // Split if next char is uppercase letter (most sentence starts)
      const nextIsCapital = next && /[A-Z]/.test(next);
      if (!prevIsDigit && !isAbbrev && nextIsCapital) {
        sentences.push(buffer.trim());
        buffer = '';
        i++; // consume the space
      }
    }
  }
  if (buffer.trim()) sentences.push(buffer.trim());

  // Post-process: merge fragments that are too short (likely splits we shouldn't have made)
  const merged = [];
  for (const s of sentences) {
    if (merged.length > 0 && s.split(' ').length < 4) {
      merged[merged.length - 1] += ' ' + s;
    } else {
      merged.push(s);
    }
  }

  return merged;
}

// Wrap quantities/times/temps in <mark> tags so the UI can style them prominently.
// Returns an array of { type: 'text' | 'highlight', value: string } segments.
export function highlightInStep(sentence) {
  if (!sentence) return [];
  const segments = [];
  let lastIdx = 0;
  // Build a master regex that combines all patterns (with the global flag)
  const combined = HIGHLIGHT_PATTERNS
    .map(p => p.source)
    .join('|');
  const re = new RegExp('(' + combined + ')', 'gi');
  let match;
  while ((match = re.exec(sentence)) !== null) {
    if (match.index > lastIdx) {
      segments.push({ type: 'text', value: sentence.slice(lastIdx, match.index) });
    }
    segments.push({ type: 'highlight', value: match[0] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < sentence.length) {
    segments.push({ type: 'text', value: sentence.slice(lastIdx) });
  }
  return segments;
}

// =====================================================
// PARALLEL TASK DETECTION
// =====================================================
// When a step has a long timer (rice cooking, oven roasting), the user is just standing there.
// Look ahead in the upcoming steps for prep work that can be done in parallel:
//   - "prep" phase steps (chopping, mixing)
//   - Short cooking steps that don't conflict with the current one
//
// Returns: { hasParallel: boolean, suggestion: string, fromStepIdx: number }
export function detectParallelTask(currentStep, allSteps, currentIdx) {
  if (!currentStep || !currentStep.timerSec || currentStep.timerSec < 240) {
    // Only worth suggesting if the current step keeps you waiting > 4 min
    return { hasParallel: false };
  }

  // If the recipe author specified a parallelTask, use that
  if (currentStep.parallelTask) {
    return {
      hasParallel: true,
      suggestion: currentStep.parallelTask,
      source: 'authored'
    };
  }

  // Otherwise, scan upcoming steps for prep work we can preview
  const upcoming = allSteps.slice(currentIdx + 1);
  // Find the first upcoming PREP step (never suggest plate steps as parallel work)
  const nextPrep = upcoming.find(s => (s.phase || 'cook') === 'prep');
  if (nextPrep) {
    // Take the first sentence of the prep step as the suggestion
    const firstSentence = splitStepIntoBullets(nextPrep.text)[0] || nextPrep.text;
    return {
      hasParallel: true,
      suggestion: 'While you wait: ' + firstSentence,
      source: 'auto',
      fromStepIdx: currentIdx + 1 + upcoming.indexOf(nextPrep)
    };
  }

  return { hasParallel: false };
}
