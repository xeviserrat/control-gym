-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "muscle_group" TEXT,
    "default_rep_range" TEXT,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routines" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superset_groups" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "label" TEXT,

    CONSTRAINT "superset_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps_min" INTEGER NOT NULL,
    "reps_max" INTEGER NOT NULL,
    "rest_seconds" INTEGER NOT NULL DEFAULT 90,
    "notes" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "load_progression" BOOLEAN NOT NULL DEFAULT true,
    "superset_group_id" UUID,
    "superset_order" INTEGER,

    CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "status" "WorkoutStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" UUID NOT NULL,
    "workout_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "routine_exercise_id" UUID,
    "order" INTEGER NOT NULL,
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sets" (
    "id" UUID NOT NULL,
    "workout_exercise_id" UUID NOT NULL,
    "set_number" INTEGER NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL,
    "reps" INTEGER NOT NULL,
    "rir" INTEGER,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "exercises_user_id_idx" ON "exercises"("user_id");

-- CreateIndex
CREATE INDEX "routines_user_id_idx" ON "routines"("user_id");

-- CreateIndex
CREATE INDEX "superset_groups_routine_id_idx" ON "superset_groups"("routine_id");

-- CreateIndex
CREATE INDEX "routine_exercises_routine_id_idx" ON "routine_exercises"("routine_id");

-- CreateIndex
CREATE INDEX "routine_exercises_superset_group_id_idx" ON "routine_exercises"("superset_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_exercises_routine_id_order_key" ON "routine_exercises"("routine_id", "order");

-- CreateIndex
CREATE INDEX "workouts_user_id_date_idx" ON "workouts"("user_id", "date");

-- CreateIndex
CREATE INDEX "workouts_routine_id_idx" ON "workouts"("routine_id");

-- CreateIndex
CREATE INDEX "workout_exercises_workout_id_idx" ON "workout_exercises"("workout_id");

-- CreateIndex
CREATE INDEX "workout_sets_workout_exercise_id_idx" ON "workout_sets"("workout_exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_sets_workout_exercise_id_set_number_key" ON "workout_sets"("workout_exercise_id", "set_number");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "superset_groups" ADD CONSTRAINT "superset_groups_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "superset_groups" ADD CONSTRAINT "superset_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_superset_group_id_fkey" FOREIGN KEY ("superset_group_id") REFERENCES "superset_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
