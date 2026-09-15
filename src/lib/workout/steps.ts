export interface RoutineExerciseForSteps {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
  isOptional: boolean;
  loadProgression: boolean;
  supersetGroupId: string | null;
  supersetOrder: number | null;
}

export interface WorkoutStep {
  workoutExerciseId: string;
  routineExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
  isOptional: boolean;
  loadProgression: boolean;
  supersetGroupId: string | null;
  isLastInSupersetRound: boolean;
}

interface WorkoutExerciseForSteps {
  id: string;
  routineExerciseId: string | null;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
  isOptional: boolean;
  loadProgression: boolean;
  supersetGroupId: string | null;
  supersetOrder: number | null;
}

function groupExercises(exercises: WorkoutExerciseForSteps[]) {
  const blocks: WorkoutExerciseForSteps[][] = [];
  const seenGroups = new Set<string>();

  for (const ex of exercises) {
    if (ex.supersetGroupId) {
      if (seenGroups.has(ex.supersetGroupId)) continue;
      seenGroups.add(ex.supersetGroupId);
      const group = exercises
        .filter((e) => e.supersetGroupId === ex.supersetGroupId)
        .sort((a, b) => (a.supersetOrder ?? 0) - (b.supersetOrder ?? 0));
      blocks.push(group);
    } else {
      blocks.push([ex]);
    }
  }

  return blocks.sort((a, b) => a[0].order - b[0].order);
}

export function buildWorkoutSteps(
  exercises: WorkoutExerciseForSteps[],
): WorkoutStep[] {
  const blocks = groupExercises(exercises);
  const steps: WorkoutStep[] = [];

  for (const block of blocks) {
    const maxSets = Math.max(...block.map((e) => e.sets));

    for (let setNum = 1; setNum <= maxSets; setNum++) {
      for (let i = 0; i < block.length; i++) {
        const ex = block[i];
        if (setNum > ex.sets) continue;

        const isLastInRound =
          i === block.length - 1 ||
          block.slice(i + 1).every((e) => setNum > e.sets);

        steps.push({
          workoutExerciseId: ex.id,
          routineExerciseId: ex.routineExerciseId ?? ex.id,
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          setNumber: setNum,
          totalSets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          isOptional: ex.isOptional,
          loadProgression: ex.loadProgression,
          supersetGroupId: ex.supersetGroupId,
          isLastInSupersetRound: isLastInRound,
        });
      }
    }
  }

  return steps;
}

export function countTotalSteps(exercises: WorkoutExerciseForSteps[]): number {
  return buildWorkoutSteps(exercises).length;
}

export function buildStepsFromRoutine(
  exercises: RoutineExerciseForSteps[],
  workoutExerciseIdMap: Map<string, string>,
): WorkoutStep[] {
  const mapped: WorkoutExerciseForSteps[] = exercises.map((ex) => ({
    id: workoutExerciseIdMap.get(ex.id) ?? ex.id,
    routineExerciseId: ex.id,
    exerciseId: ex.exerciseId,
    exerciseName: ex.exerciseName,
    order: ex.order,
    sets: ex.sets,
    repsMin: ex.repsMin,
    repsMax: ex.repsMax,
    restSeconds: ex.restSeconds,
    notes: ex.notes,
    isOptional: ex.isOptional,
    loadProgression: ex.loadProgression,
    supersetGroupId: ex.supersetGroupId,
    supersetOrder: ex.supersetOrder,
  }));

  return buildWorkoutSteps(mapped);
}
