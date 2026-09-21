export type ProgressionResult = "increase" | "maintain";

export type ProgressionHintKind =
  | "ready_to_increase"
  | "weight_too_light"
  | "maintain"
  | "under_working_weight";

export interface SetResult {
  reps: number;
}

export interface WeightedSetResult extends SetResult {
  weight: number;
}

export interface ProgressionHintContent {
  kind: ProgressionHintKind;
  title: string;
  message: string;
  variant: "success" | "warning";
}

export type InSessionProgressionHint = ProgressionHintContent;

export const DEFAULT_WEIGHT_INCREMENT = 2.5;

function repRangeLabel(repsMin: number, repsMax: number): string {
  if (repsMin === repsMax) return String(repsMax);
  return `${repsMin}–${repsMax}`;
}

function describeWeakSets(sets: SetResult[], repsMax: number): string {
  const weak = sets
    .map((s, i) => ({ setNumber: i + 1, reps: s.reps }))
    .filter((s) => s.reps < repsMax);

  if (weak.length === 0) return "";

  if (weak.length === 1) {
    const w = weak[0];
    return `La serie ${w.setNumber} fue la más débil (${w.reps} reps).`;
  }

  const parts = weak.map((w) => `serie ${w.setNumber} (${w.reps})`).join(", ");
  return `Quedaron por debajo: ${parts}.`;
}

function buildMaintainMessage(
  sets: SetResult[],
  repsMin: number,
  repsMax: number,
  setNumber?: number,
): string {
  const range = repRangeLabel(repsMin, repsMax);
  const weakDesc = describeWeakSets(sets, repsMax);

  if (setNumber != null) {
    const prevSet = sets[setNumber - 1];
    if (prevSet && prevSet.reps < repsMax) {
      return `En la serie ${setNumber} la última vez hiciste ${prevSet.reps} reps. Apunta a ${range}.`;
    }
    if (prevSet && prevSet.reps >= repsMax && weakDesc) {
      return `${weakDesc} Apunta a ${range} en todas las series.`;
    }
  }

  if (weakDesc) {
    return `${weakDesc} Apunta a ${range} en todas las series.`;
  }

  return `Intenta acercarte a ${repsMax} reps en todas las series (${range}).`;
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

export function hasConsistentWeight(sets: WeightedSetResult[]): boolean {
  if (sets.length === 0) return false;
  const firstWeight = sets[0].weight;
  return sets.every((s) => s.weight === firstWeight);
}

/** All sets strictly above the top of the rep range. */
export function isExceedingRepRange(
  sets: SetResult[],
  repsMax: number,
): boolean {
  if (sets.length === 0) return false;
  return sets.every((s) => s.reps > repsMax);
}

/**
 * Ready to increase when last session hit repsMax on every set at the same weight,
 * without exceeding the range on all sets (that indicates weight was too light).
 */
export function isReadyToIncreaseWeight(
  sets: WeightedSetResult[],
  repsMin: number,
  repsMax: number,
): boolean {
  if (sets.length === 0) return false;
  if (!hasConsistentWeight(sets)) return false;
  if (isExceedingRepRange(sets, repsMax)) return false;
  return evaluateProgression(sets, repsMin, repsMax) === "increase";
}

export function suggestNextWeight(currentWeight: number): number {
  return currentWeight + DEFAULT_WEIGHT_INCREMENT;
}

type ProgressionFeedbackOptions = {
  setNumber?: number;
  context?: "training" | "session_end";
};

export function getSessionProgressionFeedback(
  sets: WeightedSetResult[],
  repsMin: number,
  repsMax: number,
  options?: ProgressionFeedbackOptions,
): ProgressionHintContent {
  const setNumber = options?.setNumber;
  const isTraining =
    options?.context === "training" || setNumber != null;
  const range = repRangeLabel(repsMin, repsMax);

  if (sets.length === 0) {
    return {
      kind: "maintain",
      title: "Mantén el peso",
      message: `Intenta acercarte a ${repsMax} reps (${range}).`,
      variant: "warning",
    };
  }

  if (hasConsistentWeight(sets) && isExceedingRepRange(sets, repsMax)) {
    return {
      kind: "weight_too_light",
      title: "Peso demasiado bajo",
      message: `Superaste el rango (${range}) con facilidad en todas las series. Sube el peso y vuelve a apuntar a ${range}.`,
      variant: "warning",
    };
  }

  if (isReadyToIncreaseWeight(sets, repsMin, repsMax)) {
    return {
      kind: "ready_to_increase",
      title: isTraining ? "Listo para subir peso" : "Objetivo conseguido",
      message: isTraining
        ? `Llegaste al tope del rango (${range}) en todas las series. Sube un poco el peso y apunta de nuevo a ${range}.`
        : `Llegaste al tope del rango (${range}) en todas las series. Siguiente sesión: sube un poco el peso.`,
      variant: "success",
    };
  }

  return {
    kind: "maintain",
    title: "Mantén el peso",
    message: buildMaintainMessage(sets, repsMin, repsMax, setNumber),
    variant: "warning",
  };
}

export function getInSessionProgressionHint(
  previousSets: WeightedSetResult[] | undefined,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
): InSessionProgressionHint | null {
  if (!loadProgression || !previousSets?.length) return null;

  const feedback = getSessionProgressionFeedback(previousSets, repsMin, repsMax, {
    context: "training",
  });

  if (
    feedback.kind === "ready_to_increase" ||
    feedback.kind === "weight_too_light"
  ) {
    return feedback;
  }

  return null;
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
  return currentWeight >= previousWeight && currentReps >= repsMax;
}

export type CompletedSetFeedback = {
  kind: ProgressionHintKind;
  title: string;
  message: string;
  variant: "success" | "warning";
};

/** Per-set feedback for a completed session (history / summary). */
export function getCompletedSetFeedback(
  set: WeightedSetResult,
  setNumber: number,
  allSets: WeightedSetResult[],
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
): CompletedSetFeedback | null {
  if (!loadProgression || allSets.length === 0) return null;

  const range = repRangeLabel(repsMin, repsMax);
  const isLastSet = setNumber === allSets.length;
  const sessionFeedback = getSessionProgressionFeedback(allSets, repsMin, repsMax, {
    context: "session_end",
  });

  if (sessionFeedback.kind === "weight_too_light") {
    return {
      kind: "weight_too_light",
      title: "Por encima del rango",
      message: isLastSet
        ? sessionFeedback.message
        : `Superaste el objetivo (${range}).`,
      variant: "warning",
    };
  }

  if (sessionFeedback.kind === "ready_to_increase") {
    return {
      kind: "ready_to_increase",
      title: "En el tope del rango",
      message: isLastSet
        ? sessionFeedback.message
        : `Dentro del objetivo (${range}).`,
      variant: "success",
    };
  }

  if (set.reps < repsMin) {
    return {
      kind: "maintain",
      title: "Por debajo del mínimo",
      message: `Apunta a ${range} la próxima vez.`,
      variant: "warning",
    };
  }

  if (set.reps < repsMax) {
    return {
      kind: "maintain",
      title: "Por debajo del objetivo",
      message: `Apunta a ${range} la próxima vez.`,
      variant: "warning",
    };
  }

  if (set.reps > repsMax) {
    return {
      kind: "maintain",
      title: "Por encima del rango",
      message: `Superaste el objetivo (${range}) en esta serie.`,
      variant: "warning",
    };
  }

  return {
    kind: "maintain",
    title: "En el tope del rango",
    message: `Objetivo alcanzado en esta serie (${range}).`,
    variant: "success",
  };
}

export function getUnderWorkingWeightHint(
  currentWeight: number,
  currentReps: number,
  previousSets: WeightedSetResult[],
  setNumber: number,
  repsMin: number,
  repsMax: number,
): ProgressionHintContent | null {
  const prevSet = previousSets[setNumber - 1];
  if (!prevSet) return null;
  if (currentWeight >= prevSet.weight || currentReps <= repsMax) return null;

  const range = repRangeLabel(repsMin, repsMax);
  return {
    kind: "under_working_weight",
    title: "Peso por debajo del de trabajo",
    message: `Estás por debajo del peso de la última vez y te pasas del rango (${range}). Vuelve al peso habitual y apunta a ${range}.`,
    variant: "warning",
  };
}

/** @deprecated Use getSessionProgressionFeedback instead. */
export function getProgressionMessage(result: ProgressionResult): {
  title: string;
  message: string;
  variant: "success" | "warning";
} {
  if (result === "increase") {
    return {
      title: "Objetivo conseguido",
      message: "Siguiente sesión: sube un poco el peso.",
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
