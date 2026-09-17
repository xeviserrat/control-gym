-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "reps_min" INTEGER;
ALTER TABLE "exercises" ADD COLUMN "reps_max" INTEGER;

-- Migrate legacy text ranges like "8-10" or "8–10"
UPDATE "exercises"
SET
  "reps_min" = CAST(
    TRIM(SPLIT_PART(REGEXP_REPLACE("default_rep_range", '[–−]', '-', 'g'), '-', 1))
    AS INTEGER
  ),
  "reps_max" = CAST(
    COALESCE(
      NULLIF(
        TRIM(SPLIT_PART(REGEXP_REPLACE("default_rep_range", '[–−]', '-', 'g'), '-', 2)),
        ''
      ),
      TRIM(SPLIT_PART(REGEXP_REPLACE("default_rep_range", '[–−]', '-', 'g'), '-', 1))
    ) AS INTEGER
  )
WHERE "default_rep_range" IS NOT NULL
  AND TRIM("default_rep_range") ~ '^\d+\s*[-–−]?\s*\d*$';

ALTER TABLE "exercises" DROP COLUMN "default_rep_range";
