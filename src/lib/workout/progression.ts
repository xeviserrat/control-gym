export type ProgressionResult = "increase" | "maintain";

export interface SetResult {
  reps: number;
}

export interface WeightedSetResult extends SetResult {
  weight: number;
}

export const DEFAULT_WEIGHT_INCREMENT = 2.5;

/**
 * Double progression: suggest weight increase when all sets hit repsMax.
 */
export function evaluateProgression(
  sets: SetResult[],
  repsMin: number,
  repsMax: number,
): ProgressionResult {
  if (sets.length === 0) return "maintain";

  const allAtMax = sets.every((s) => s.reps >= repsMax);
  if (allAtMax) return "increase";

  const allAtOrAboveMin = sets.every((s) => s.reps >= repsMin);
  if (allAtOrAboveMin) return "maintain";

  return "maintain";
}

export function hasConsistentWeight(sets: WeightedSetResult[]): boolean {
  if (sets.length === 0) return false;
  const firstWeight = sets[0].weight;
  return sets.every((s) => s.weight === firstWeight);
}

/**
 * Ready to increase when last session hit repsMax on every set at the same weight.
 */
export function isReadyToIncreaseWeight(
  sets: WeightedSetResult[],
  repsMin: number,
  repsMax: number,
): boolean {
  if (sets.length === 0) return false;
  if (!hasConsistentWeight(sets)) return false;
  return evaluateProgression(sets, repsMin, repsMax) === "increase";
}

export function suggestNextWeight(currentWeight: number): number {
  return currentWeight + DEFAULT_WEIGHT_INCREMENT;
}

export interface InSessionProgressionHint {
  previousWeight: number;
  suggestedWeight: number;
  title: string;
}

export function getInSessionProgressionHint(
  previousSets: WeightedSetResult[] | undefined,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
): InSessionProgressionHint | null {
  if (!loadProgression || !previousSets?.length) return null;
  if (!isReadyToIncreaseWeight(previousSets, repsMin, repsMax)) return null;

  const previousWeight = previousSets[0].weight;
  const suggestedWeight = suggestNextWeight(previousWeight);

  return {
    previousWeight,
    suggestedWeight,
    title: "Listo para subir peso",
  };
}

export function isRepeatingQualifyingPerformance(
  currentWeight: number,
  currentReps: number,
  previousSets: WeightedSetResult[],
  repsMin: number,
  repsMax: number,
): boolean {
  if (!isReadyToIncreaseWeight(previousSets, repsMin, repsMax)) return false;
  const previousWeight = previousSets[0].weight;
  return currentWeight <= previousWeight && currentReps >= repsMax;
}

export function getProgressionMessage(result: ProgressionResult): {
  title: string;
  message: string;
  variant: "success" | "warning";
} {
  if (result === "increase") {
    return {
      title: "Objetivo conseguido",
      message: "Siguiente sesión: considera subir el peso.",
      variant: "success",
    };
  }

  return {
    title: "Mantén el peso",
    message: "Intenta conseguir alguna repetición más la próxima vez.",
    variant: "warning",
  };
}

export function calculateVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
}
