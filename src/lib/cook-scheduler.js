// cook-scheduler.js
// =================
// Analyzes a recipe's steps and produces an optimized cooking timeline
// that groups parallel tasks — things you can do simultaneously to
// cut total cooking time.
//
// CONCEPTS:
//   - "Passive" step: starts a timer and then leaves you free (rice boiling,
//     oven roasting, marinating). You start it then move on.
//   - "Active" step: requires your hands the whole time (chopping, mixing,
//     searing with constant attention). Cannot be done in parallel with
//     another active step.
//   - "Wave": a set of tasks that can happen at the same time. A wave has
//     one or more passive timers running PLUS any active tasks you can do
//     with your hands while they run.
//
// OUTPUT:
//   A CookPlan with:
//     - waves: ordered array of { passiveSteps, activeSteps, startsAt, endsAt }
//     - linearMinutes: how long it would take done sequentially
//     - parallelMinutes: how long with this optimized plan
//     - savedMinutes: the difference
//     - hasParallelism: boolean — whether the plan is meaningfully better

// A step is "passive" (fire and forget) if:
//   - It has a timer >= 4 minutes, AND
//   - Its text suggests it's hands-off (oven, simmer, boil, marinate, rest, soak)
// Everything else is "active" (needs your hands).
const PASSIVE_KEYWORDS = [
  'oven', 'roast', 'bake', 'simmer', 'boil', 'cover and', 'covered',
  'marinate', 'rest', 'soak', 'steep', 'chill', 'refrigerate',
  'reduce to low', 'reduce heat to low', 'off heat', 'broil',
  'air fry', 'air-fry', 'steam', 'poach', 'braise'
];
const ACTIVE_KEYWORDS = [
  'stir constantly', 'stir frequently', 'stirring constantly', 'stirring frequently',
  'do not leave', 'watch closely', 'keep an eye', 'stir-fry', 'stir fry',
  'toss constantly', 'flip every', 'sear undisturbed'  // sear starts passive then needs flip
];

// Keywords that indicate a waiting period embedded in a prep step
const WAIT_IN_PREP = ['marinate', 'let sit', 'let rest', 'rest for', 'refrigerate', 'soak', 'steep', 'chill'];

export function isPassiveStep(step) {
  if (!step.timerSec || step.timerSec < 240) return false; // < 4 min = too short to parallelize
  if (step.phase === 'plate') return false;
  // Prep steps are normally active (chopping etc) — EXCEPT when they include
  // an explicit waiting period (marinating, resting) with a long timer
  if (step.phase === 'prep') {
    const text = (step.text || '').toLowerCase();
    const hasWait = WAIT_IN_PREP.some(kw => text.includes(kw));
    if (!hasWait) return false; // pure prep, not passive
    // It's a compound step: active work + passive wait. Treat as passive
    // but deduct ~5 min for the active part at the start
    return step.timerSec >= 480; // at least 8 min total (5 active + 3 wait)
  }
  const text = (step.text || '').toLowerCase();
  // If explicitly active-keyword, not passive even with long timer
  if (ACTIVE_KEYWORDS.some(kw => text.includes(kw))) return false;
  // If has passive keyword, it's passive
  return PASSIVE_KEYWORDS.some(kw => text.includes(kw));
}

// Estimate how long an ACTIVE step takes with your hands
// (timerSec is sometimes set for active steps too, representing their duration)
export function getActiveMinutes(step) {
  if (step.timerSec) return step.timerSec / 60;
  // Estimate based on step type if no timer
  if (step.phase === 'prep') {
    const text = (step.text || '').toLowerCase();
    if (text.includes('julienne') || text.includes('dice') || text.includes('chop')) return 4;
    if (text.includes('slice') || text.includes('mince')) return 3;
    if (text.includes('mix') || text.includes('whisk') || text.includes('toss')) return 2;
    return 3; // default prep
  }
  return 3; // default active cook step
}

// ===========================================================================
// MAIN SCHEDULER
// ===========================================================================
// Takes the resolved steps array (after applying equipment/ingredient modes)
// and returns a CookPlan.
export function buildCookPlan(steps) {
  if (!steps || steps.length === 0) {
    return { waves: [], linearMinutes: 0, parallelMinutes: 0, savedMinutes: 0, hasParallelism: false };
  }

  // Compute linear time (sequential execution)
  const linearMinutes = steps.reduce((total, step) => {
    if (step.timerSec) return total + step.timerSec / 60;
    return total + getActiveMinutes(step);
  }, 0);

  // Build the plan by simulating cooking order.
  // We use a greedy approach: at each moment, start all passive steps that
  // are "ready" (their dependencies done), and fill passive wait-time with active steps.

  // For dependency tracking: in a recipe, step N generally depends on step N-1.
  // But passive steps can be started independently as long as earlier passive
  // steps in the sequence have been started (not necessarily finished).
  // We use a simple heuristic: passive steps can be started in order,
  // and prep steps between two passive steps belong to the SECOND passive step's wave.

  const waves = [];
  let currentTimeMin = 0;
  const usedStepIds = new Set();

  // Group steps into segments: each segment is one passive step + the active
  // steps that can be done while it runs.
  // Algorithm:
  //   1. Walk steps in order
  //   2. When we hit a passive step, start a new wave with it as the anchor
  //   3. Collect all following active steps (until the next passive step or end)
  //      as "do now" tasks for that wave
  //   4. If the active tasks take LESS time than the passive timer, we save time

  let i = 0;
  while (i < steps.length) {
    const step = steps[i];

    if (isPassiveStep(step) && !usedStepIds.has(step.id)) {
      // Start a new wave anchored on this passive step
      const passiveMinutes = step.timerSec / 60;
      const passiveSteps = [step];
      usedStepIds.add(step.id);

      // Look ahead: are there more passive steps starting at roughly the same time?
      // (e.g. oven has two sheet pans — both go in at the same time)
      let j = i + 1;
      while (j < steps.length && isPassiveStep(steps[j]) && !usedStepIds.has(steps[j].id)) {
        // Only group them if they're immediately consecutive
        if (j === i + 1) {
          passiveSteps.push(steps[j]);
          usedStepIds.add(steps[j].id);
          j++;
        } else break;
      }

      const longestPassive = Math.max(...passiveSteps.map(s => s.timerSec / 60));

      // Collect active steps that can fill the passive wait time
      const activeSteps = [];
      let activeTimeUsed = 0;
      let k = j;
      while (k < steps.length && !isPassiveStep(steps[k]) && !usedStepIds.has(steps[k].id)) {
        const activeMin = getActiveMinutes(steps[k]);
        if (activeTimeUsed + activeMin <= longestPassive + 2) { // allow slight overage
          activeSteps.push(steps[k]);
          usedStepIds.add(steps[k].id);
          activeTimeUsed += activeMin;
          k++;
        } else {
          break; // don't cram in more than fits
        }
      }

      const waveTime = longestPassive; // limited by the passive step, not active
      waves.push({
        type: 'parallel',
        passiveSteps,
        activeSteps,
        durationMin: waveTime,
        activeMin: activeTimeUsed,
        savedMin: Math.max(0, activeTimeUsed - 0), // vs doing active after passive
        startsAt: currentTimeMin,
        endsAt: currentTimeMin + waveTime,
      });
      currentTimeMin += waveTime;
      i = k; // advance past all steps we consumed
    } else if (!usedStepIds.has(step.id)) {
      // Active-only step — no parallelism, just do it
      const activeMin = getActiveMinutes(step);
      waves.push({
        type: 'sequential',
        passiveSteps: [],
        activeSteps: [step],
        durationMin: activeMin,
        activeMin,
        savedMin: 0,
        startsAt: currentTimeMin,
        endsAt: currentTimeMin + activeMin,
      });
      usedStepIds.add(step.id);
      currentTimeMin += activeMin;
      i++;
    } else {
      i++; // already consumed by a wave
    }
  }

  const parallelMinutes = currentTimeMin;
  const savedMinutes = Math.max(0, linearMinutes - parallelMinutes);
  const hasParallelism = waves.some(w => w.type === 'parallel' && w.activeSteps.length > 0);

  return { waves, linearMinutes, parallelMinutes, savedMinutes, hasParallelism };
}

// Check if a recipe is worth showing the parallel mode
// (needs at least one wave with 2+ things happening simultaneously)
export function recipeHasParallelism(steps) {
  if (!steps) return false;
  const plan = buildCookPlan(steps);
  return plan.hasParallelism && plan.savedMinutes >= 3; // only if saves at least 3 min
}
