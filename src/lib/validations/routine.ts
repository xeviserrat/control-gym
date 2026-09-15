import { z } from "zod";

export const routineSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  description: z.string().max(500).optional(),
});

export const routineExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  repsMin: z.number().int().min(1).max(100),
  repsMax: z.number().int().min(1).max(100),
  restSeconds: z.number().int().min(0).max(600),
  notes: z.string().max(500).optional(),
  isOptional: z.boolean().default(false),
  loadProgression: z.boolean().default(true),
});

export type RoutineInput = z.infer<typeof routineSchema>;
export type RoutineExerciseInput = z.infer<typeof routineExerciseSchema>;
