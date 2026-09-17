import { z } from "zod";
import { MUSCLE_GROUPS } from "@/lib/exercise-utils";

const optionalRepField = z.preprocess(
  (value) => (value === "" || value == null ? undefined : Number(value)),
  z.number().int().min(1).max(100).optional(),
);

export const exerciseSchema = z
  .object({
    name: z.string().min(1, "Nombre requerido").max(100),
    description: z.string().max(500).optional(),
    muscleGroup: z
      .union([z.enum(MUSCLE_GROUPS), z.literal("")])
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    repsMin: optionalRepField,
    repsMax: optionalRepField,
  })
  .superRefine((data, ctx) => {
    const hasMin = data.repsMin != null;
    const hasMax = data.repsMax != null;

    if (hasMin !== hasMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica reps mín y reps máx, o déjalos vacíos",
        path: hasMin ? ["repsMax"] : ["repsMin"],
      });
      return;
    }

    if (hasMin && hasMax && data.repsMin! > data.repsMax!) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reps mín no puede ser mayor que reps máx",
        path: ["repsMax"],
      });
    }
  });

export type ExerciseInput = z.infer<typeof exerciseSchema>;
