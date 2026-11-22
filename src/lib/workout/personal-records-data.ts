import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bestPersonalMarks, findPersonalRecords } from "./personal-records";

type RecordsDatabase = Pick<Prisma.TransactionClient, "workout" | "workoutSet">;

const setFields = { weight: true, reps: true } satisfies Prisma.WorkoutSetSelect;

async function readRecordedSets(
  database: RecordsDatabase,
  exerciseFilter: Prisma.WorkoutExerciseWhereInput,
) {
  const sets = await database.workoutSet.findMany({
    where: {
      weight: { gt: 0 },
      workoutExercise: exerciseFilter,
    },
    select: {
      ...setFields,
      workoutExercise: { select: { exerciseId: true } },
    },
  });

  return sets.map(({ weight, reps, workoutExercise }) => ({
    exerciseId: workoutExercise.exerciseId,
    reps,
    weight: Number(weight),
  }));
}

export async function getWorkoutPersonalRecords(
  userId: string,
  workoutId: string,
  database: RecordsDatabase = prisma,
) {
  const completedWorkout = { userId, status: "COMPLETED" } as const;
  const workout = await database.workout.findFirst({
    where: { ...completedWorkout, id: workoutId },
    select: {
      id: true,
      date: true,
      startedAt: true,
      exercises: {
        select: {
          exerciseId: true,
          sets: { where: { weight: { gt: 0 } }, select: setFields },
        },
      },
    },
  });
  if (!workout) return [];

  const sessionSets = workout.exercises.flatMap(({ exerciseId, sets }) =>
    sets.map(({ weight, reps }) => ({ exerciseId, reps, weight: Number(weight) })),
  );
  if (sessionSets.length === 0) return [];

  const { date, startedAt, id } = workout;
  const previousSets = await readRecordedSets(database, {
    exerciseId: { in: [...new Set(sessionSets.map((set) => set.exerciseId))] },
    workout: {
      ...completedWorkout,
      OR: [
        { date: { lt: date } },
        { date, startedAt: { lt: startedAt } },
        { date, startedAt, id: { lt: id } },
      ],
    },
  });

  return findPersonalRecords(sessionSets, previousSets);
}

export async function getExercisePersonalMarks(userId: string, exerciseId: string) {
  const sets = await readRecordedSets(prisma, {
    exerciseId,
    workout: { userId, status: "COMPLETED" },
  });

  return Array.from(bestPersonalMarks(sets).values()).sort((a, b) => a.reps - b.reps);
}
