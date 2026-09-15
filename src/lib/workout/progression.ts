export type ProgressionResult = "increase" | "maintain";

export interface SetResult {
  reps: number;
}

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
