import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  description: z.string().max(500).optional(),
  muscleGroup: z.string().max(50).optional(),
  defaultRepRange: z.string().max(20).optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
