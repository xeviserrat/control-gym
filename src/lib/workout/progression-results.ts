import {
  getSessionProgressionFeedback,
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
      const feedback = getSessionProgressionFeedback(
        weightedSets,
        we.repsMin,
        we.repsMax,
      );

      return {
        exerciseName: we.exercise.name,
        title: feedback.title,
        message: feedback.message,
        variant: feedback.variant,
      };
    });
}

function buildExerciseTrainingHint(
  exerciseName: string,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
  previousSets?: WeightedSetResult[],
  setNumber?: number,
): StartTrainingHint | null {
  if (!loadProgression || !previousSets?.length) return null;

  const feedback = getSessionProgressionFeedback(previousSets, repsMin, repsMax, {
    setNumber,
    context: "training",
  });

  return {
    exerciseName,
    title: feedback.title,
    message: feedback.message,
    variant: feedback.variant,
  };
}

export function getExerciseTrainingHint(
  exerciseName: string,
  previousSets: WeightedSetResult[] | undefined,
  repsMin: number,
  repsMax: number,
  loadProgression: boolean,
  setNumber?: number,
): StartTrainingHint | null {
  return buildExerciseTrainingHint(
    exerciseName,
    repsMin,
    repsMax,
    loadProgression,
    previousSets,
    setNumber,
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
