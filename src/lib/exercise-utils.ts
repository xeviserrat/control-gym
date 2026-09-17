export const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Cardio",
  "General",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const DEFAULT_ROUTINE_REPS = { min: 8, max: 12 } as const;

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Pecho: "border-l-rose-500 bg-rose-500/5",
  Espalda: "border-l-blue-500 bg-blue-500/5",
  Piernas: "border-l-amber-500 bg-amber-500/5",
  Hombros: "border-l-violet-500 bg-violet-500/5",
  Bíceps: "border-l-emerald-500 bg-emerald-500/5",
  Tríceps: "border-l-cyan-500 bg-cyan-500/5",
  Core: "border-l-orange-500 bg-orange-500/5",
  Cardio: "border-l-red-500 bg-red-500/5",
  General: "border-l-slate-500 bg-slate-500/5",
};

const DEFAULT_COLOR = "border-l-primary bg-primary/5";

export function getMuscleGroupStyle(muscleGroup: string | null | undefined) {
  if (!muscleGroup) return DEFAULT_COLOR;
  return MUSCLE_GROUP_COLORS[muscleGroup] ?? DEFAULT_COLOR;
}

export function groupExercisesByMuscle<T extends { muscleGroup: string | null }>(
  exercises: T[],
) {
  const groups = new Map<string, T[]>();

  for (const exercise of exercises) {
    const key = exercise.muscleGroup ?? "Sin categoría";
    const list = groups.get(key) ?? [];
    list.push(exercise);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === "Sin categoría") return 1;
    if (b === "Sin categoría") return -1;
    return a.localeCompare(b, "es");
  });
}

type ExerciseRepSource = {
  readonly repsMin: number | null;
  readonly repsMax: number | null;
};

export function getExerciseRepDefaults(
  exercise: ExerciseRepSource,
): { repsMin: number; repsMax: number } {
  if (exercise.repsMin != null && exercise.repsMax != null) {
    return { repsMin: exercise.repsMin, repsMax: exercise.repsMax };
  }

  return {
    repsMin: DEFAULT_ROUTINE_REPS.min,
    repsMax: DEFAULT_ROUTINE_REPS.max,
  };
}
