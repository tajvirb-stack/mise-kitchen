// Legacy hook signature — now backed by NutritionContext for live updates.
// All instances share the same state, so logging from one component
// updates all others instantly.
import { useNutritionContext } from '../components/NutritionContext';

export function useNutrition(/* date */) {
  return useNutritionContext();
}
