import type { WorkoutStep } from "@/lib/workout/steps";

export interface WorkoutSessionData {
  workout: {
    id: string;
    date: string;
    startedAt: string;
    routine: { name: string; id: string };
    exercises: Array<{
      id: string;
      exerciseId: string;
      skipped: boolean;
      exercise: { name: string };
      routineExercise: {
        sets: number;
        repsMin: number;
        repsMax: number;
        restSeconds: number;
        notes: string | null;
        isOptional: boolean;
      } | null;
      sets: Array<{
        id: string;
        setNumber: number;
        weight: number;
        reps: number;
        rir: number | null;
      }>;
    }>;
  };
  steps: WorkoutStep[];
  totalSteps: number;
  completedSets: number;
  previousPerformance: Record<
    string,
    { sets: { weight: number; reps: number }[]; date: string }
  >;
}
