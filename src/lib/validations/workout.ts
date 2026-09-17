import { z } from "zod";

export const completeSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0).max(9999),
  reps: z.number().int().min(0).max(999),
  rir: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional(),
});

export const startWorkoutSchema = z.object({
  routineId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const swapWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  newExerciseId: z.string().uuid(),
});

export type CompleteSetInput = z.infer<typeof completeSetSchema>;
export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;
export type SwapWorkoutExerciseInput = z.infer<typeof swapWorkoutExerciseSchema>;
