-- Rename prescription column to avoid clash with WorkoutSet relation in Prisma
ALTER TABLE "workout_exercises" RENAME COLUMN "sets" TO "target_sets";
