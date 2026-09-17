import { formatWeight } from "@/lib/utils";
import {
  evaluateProgression,
  getInSessionProgressionHint,
  getProgressionMessage,
  hasConsistentWeight,
  suggestNextWeight,
  type WeightedSetResult,
} from "@/lib/workout/progression";

export type ProgressionResultItem = {
  exerciseName: string;
  title: string;
  message: string;
  variant: "success" | "warning";
};

export type StartTrainingHint = {
  exerciseName: string;
  title: string;
  message: string;
  variant: "success" | "warning";
};

type WorkoutExerciseForProgression = {
  skipped: boolean;
  exercise: { name: string };
  sets: { weight?: number | string | { toString(): string }; reps: number }[];
  repsMin: number;
  repsMax: number;
  loadProgression: boolean;
};

function toWeightedSets(
  sets: WorkoutExerciseForProgression["sets"],
): WeightedSetResult[] {
  return sets.map((s) => ({
    weight: typeof s.weight === "number" ? s.weight : Number(s.weight ?? 0),
    reps: s.reps,
  }));
}

export function computeWorkoutProgressionResults(
  exercises: WorkoutExerciseForProgression[],
): ProgressionResultItem[] {
  return exercises
    .filter((we) => !we.skipped && we.sets.length > 0 && we.loadProgression)
    .map((we) => {
      const weightedSets = toWeightedSets(we.sets);
      const result = evaluateProgression(weightedSets, we.repsMin, we.repsMax);
      const message = getProgressionMessage(result);

      let detail = message.message;
      if (
        result === "increase" &&
        hasConsistentWeight(weightedSets) &&
        weightedSets[0]
      ) {
        detail = `${detail} Prueba ~${formatWeight(suggestNextWeight(weightedSets[0].weight))} kg.`;
      }

      return {
        exerciseName: we.exercise.name,
        title: message.title,
        message: detail,
        variant: message.variant,
      };
    });
}

function buildExerciseTrainingHint(
  exerciseName: string,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
  previousSets?: WeightedSetResult[],
): StartTrainingHint | null {
  if (!loadProgression || !previousSets?.length) return null;

  const increaseHint = getInSessionProgressionHint(
    previousSets,
    repsMin,
    repsMax,
    true,
  );

  if (increaseHint) {
    return {
      exerciseName,
      variant: "success",
      title: increaseHint.title,
      message: `Prueba ~${formatWeight(increaseHint.suggestedWeight)} kg — la última vez hiciste ${formatWeight(increaseHint.previousWeight)} kg × ${repsMax}+ reps en todas las series.`,
    };
  }

  const lastWeight = previousSets[0]?.weight;
  if (lastWeight == null) return null;

  return {
    exerciseName,
    variant: "warning",
    title: "Mantén el peso",
    message: `Intenta acercarte a ${repsMax} reps en todas las series con ~${formatWeight(lastWeight)} kg.`,
  };
}

export function getExerciseTrainingHint(
  exerciseName: string,
  previousSets: WeightedSetResult[] | undefined,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
): StartTrainingHint | null {
  return buildExerciseTrainingHint(
    exerciseName,
    repsMin,
    repsMax,
    loadProgression,
    previousSets,
  );
}

export function computeStartTrainingHints(
  slots: Array<{
    exerciseName: string;
    repsMin: number;
    repsMax: number;
    loadProgression: boolean;
    previousSets?: WeightedSetResult[];
  }>,
): StartTrainingHint[] {
  return slots
    .map(({ exerciseName, repsMin, repsMax, loadProgression, previousSets }) =>
      buildExerciseTrainingHint(
        exerciseName,
        repsMin,
        repsMax,
        loadProgression,
        previousSets,
      ),
    )
    .filter((hint): hint is StartTrainingHint => hint != null);
}
