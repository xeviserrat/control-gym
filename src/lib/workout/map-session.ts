import type { Prisma } from "@prisma/client";
import type { WorkoutSessionData } from "@/lib/workout/types";
import type { WorkoutStep } from "@/lib/workout/steps";

type WorkoutWithIncludes = Prisma.WorkoutGetPayload<{
  include: {
    routine: true;
    exercises: {
      include: {
        exercise: true;
        routineExercise: true;
        sets: true;
      };
    };
  };
}>;

export function mapWorkoutSession(
  workout: WorkoutWithIncludes,
  steps: WorkoutStep[],
  totalSteps: number,
  completedSets: number,
  previousPerformance: Record<
    string,
    { sets: { weight: number; reps: number }[]; date: Date }
  >,
): WorkoutSessionData {
  return {
    workout: {
      id: workout.id,
      date: workout.date.toISOString(),
      startedAt: workout.startedAt.toISOString(),
      routine: {
        id: workout.routine.id,
        name: workout.routine.name,
      },
      exercises: workout.exercises.map((we) => ({
        id: we.id,
        exerciseId: we.exerciseId,
        skipped: we.skipped,
        exercise: { name: we.exercise.name },
        routineExercise: we.routineExercise
          ? {
              sets: we.routineExercise.sets,
              repsMin: we.routineExercise.repsMin,
              repsMax: we.routineExercise.repsMax,
              restSeconds: we.routineExercise.restSeconds,
              notes: we.routineExercise.notes,
              isOptional: we.routineExercise.isOptional,
            }
          : null,
        sets: we.sets.map((s) => ({
          id: s.id,
          setNumber: s.setNumber,
          weight: Number(s.weight),
          reps: s.reps,
          rir: s.rir,
        })),
      })),
    },
    steps,
    totalSteps,
    completedSets,
    previousPerformance: Object.fromEntries(
      Object.entries(previousPerformance).map(([key, value]) => [
        key,
        {
          sets: value.sets,
          date: value.date.toISOString(),
        },
      ]),
    ),
  };
}
