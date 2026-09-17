-- AlterTable
ALTER TABLE "workout_exercises" ADD COLUMN "target_sets" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "workout_exercises" ADD COLUMN "reps_min" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "workout_exercises" ADD COLUMN "reps_max" INTEGER NOT NULL DEFAULT 12;
ALTER TABLE "workout_exercises" ADD COLUMN "rest_seconds" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "workout_exercises" ADD COLUMN "notes" TEXT;
ALTER TABLE "workout_exercises" ADD COLUMN "is_optional" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "workout_exercises" ADD COLUMN "load_progression" BOOLEAN NOT NULL DEFAULT true;

-- Backfill from linked routine exercises
UPDATE "workout_exercises" AS we
SET
  "target_sets" = re."sets",
  "reps_min" = re."reps_min",
  "reps_max" = re."reps_max",
  "rest_seconds" = re."rest_seconds",
  "notes" = re."notes",
  "is_optional" = re."is_optional",
  "load_progression" = re."load_progression"
FROM "routine_exercises" AS re
WHERE we."routine_exercise_id" = re."id";
