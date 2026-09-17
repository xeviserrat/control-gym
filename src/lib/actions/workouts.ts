"use server";

import { revalidatePath } from "next/cache";
import { requireUser, actionError, actionSuccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  completeSetSchema,
  startWorkoutSchema,
  swapWorkoutExerciseSchema,
} from "@/lib/validations/workout";
import { buildWorkoutSteps, countTotalSteps } from "@/lib/workout/steps";
import { calculateVolume } from "@/lib/workout/progression";
import {
  computeStartTrainingHints,
  computeWorkoutProgressionResults,
} from "@/lib/workout/progression-results";
import { mapWorkoutSession } from "@/lib/workout/map-session";
import type { WorkoutSessionData } from "@/lib/workout/types";

const workoutInclude = {
  routine: true,
  exercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: true,
      routineExercise: true,
      sets: { orderBy: { setNumber: "asc" as const } },
    },
  },
};

export async function getActiveWorkout() {
  const user = await requireUser();

  return prisma.workout.findFirst({
    where: { userId: user.id, status: "IN_PROGRESS" },
    include: workoutInclude,
  });
}

export async function getWorkouts(limit = 50) {
  const user = await requireUser();

  return prisma.workout.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    include: {
      routine: { select: { name: true } },
      exercises: {
        include: {
          sets: true,
        },
      },
    },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getWorkoutById(id: string) {
  const user = await requireUser();

  return prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: workoutInclude,
  });
}

export async function startWorkout(routineId: string, date: string) {
  const user = await requireUser();

  const parsed = startWorkoutSchema.safeParse({ routineId, date });
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const existing = await prisma.workout.findFirst({
    where: { userId: user.id, status: "IN_PROGRESS" },
  });
  if (existing) {
    return actionError("Ya tienes un entrenamiento en curso");
  }

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: user.id, isActive: true },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });
  if (!routine) return actionError("Rutina no encontrada");

  const workout = await prisma.$transaction(async (tx) => {
    const w = await tx.workout.create({
      data: {
        userId: user.id,
        routineId,
        date: new Date(date),
        status: "IN_PROGRESS",
      },
    });

    for (const ex of routine.exercises) {
      await tx.workoutExercise.create({
        data: {
          workoutId: w.id,
          exerciseId: ex.exerciseId,
          routineExerciseId: ex.id,
          order: ex.order,
          targetSets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          isOptional: ex.isOptional,
          loadProgression: ex.loadProgression,
        },
      });
    }

    return w;
  });

  revalidatePath("/train");
  return actionSuccess(workout);
}

export async function getWorkoutSession(
  workoutId: string,
): Promise<WorkoutSessionData | null> {
  const user = await requireUser();

  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id },
    include: workoutInclude,
  });
  if (!workout) return null;

  const exercisesForSteps = workout.exercises.map((we) => ({
    id: we.id,
    routineExerciseId: we.routineExerciseId,
    exerciseId: we.exerciseId,
    exerciseName: we.exercise.name,
    order: we.order,
    sets: we.targetSets,
    repsMin: we.repsMin,
    repsMax: we.repsMax,
    restSeconds: we.restSeconds,
    notes: we.notes,
    isOptional: we.isOptional,
    loadProgression: we.loadProgression,
    supersetGroupId: we.routineExercise?.supersetGroupId ?? null,
    supersetOrder: we.routineExercise?.supersetOrder ?? null,
    skipped: we.skipped,
  }));

  const activeExercises = exercisesForSteps.filter((e) => !e.skipped);
  const steps = buildWorkoutSteps(activeExercises);
  const totalSteps = countTotalSteps(activeExercises);

  const completedSets = workout.exercises.reduce(
    (acc, we) => acc + we.sets.length,
    0,
  );

  const previousPerformance = await getPreviousPerformanceForWorkout(
    user.id,
    workout.routineId,
    workout.id,
  );

  return mapWorkoutSession(
    workout,
    steps,
    totalSteps,
    completedSets,
    previousPerformance,
  );
}

async function getPreviousPerformanceForWorkout(
  userId: string,
  routineId: string,
  currentWorkoutId: string,
) {
  const previousWorkout = await prisma.workout.findFirst({
    where: {
      userId,
      routineId,
      status: "COMPLETED",
      id: { not: currentWorkoutId },
    },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  if (!previousWorkout) return {};

  const map: Record<
    string,
    { sets: { weight: number; reps: number }[]; date: Date }
  > = {};

  for (const we of previousWorkout.exercises) {
    if (we.skipped || we.sets.length === 0) continue;

    const key = we.routineExerciseId ?? we.exerciseId;
    map[key] = {
      date: previousWorkout.date,
      sets: we.sets.map((s) => ({
        weight: Number(s.weight),
        reps: s.reps,
      })),
    };
  }

  return map;
}

export async function getPreviousExercisePerformance(exerciseId: string) {
  const user = await requireUser();

  const lastWorkoutExercise = await prisma.workoutExercise.findFirst({
    where: {
      exerciseId,
      workout: { userId: user.id, status: "COMPLETED" },
    },
    orderBy: { workout: { date: "desc" } },
    include: {
      sets: { orderBy: { setNumber: "asc" } },
      workout: { select: { date: true } },
    },
  });

  if (!lastWorkoutExercise) return null;

  return {
    date: lastWorkoutExercise.workout.date,
    sets: lastWorkoutExercise.sets.map((s) => ({
      weight: Number(s.weight),
      reps: s.reps,
    })),
  };
}

export async function completeSet(input: {
  workoutId: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
  notes?: string;
}) {
  const user = await requireUser();

  const parsed = completeSetSchema.safeParse({
    workoutExerciseId: input.workoutExerciseId,
    setNumber: input.setNumber,
    weight: input.weight,
    reps: input.reps,
    rir: input.rir,
    notes: input.notes,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const workout = await prisma.workout.findFirst({
    where: { id: input.workoutId, userId: user.id, status: "IN_PROGRESS" },
  });
  if (!workout) return actionError("Entrenamiento no encontrado");

  const workoutExercise = await prisma.workoutExercise.findFirst({
    where: {
      id: parsed.data.workoutExerciseId,
      workoutId: input.workoutId,
    },
  });
  if (!workoutExercise) return actionError("Ejercicio no encontrado");

  await prisma.workoutSet.upsert({
    where: {
      workoutExerciseId_setNumber: {
        workoutExerciseId: parsed.data.workoutExerciseId,
        setNumber: parsed.data.setNumber,
      },
    },
    update: {
      weight: parsed.data.weight,
      reps: parsed.data.reps,
      rir: parsed.data.rir,
      notes: parsed.data.notes,
      completedAt: new Date(),
    },
    create: {
      workoutExerciseId: parsed.data.workoutExerciseId,
      setNumber: parsed.data.setNumber,
      weight: parsed.data.weight,
      reps: parsed.data.reps,
      rir: parsed.data.rir,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/train/${input.workoutId}`);
  return actionSuccess(undefined);
}

export async function deleteSet(workoutId: string, setId: string) {
  const user = await requireUser();

  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id, status: "IN_PROGRESS" },
  });
  if (!workout) return actionError("Entrenamiento no encontrado");

  const set = await prisma.workoutSet.findFirst({
    where: { id: setId, workoutExercise: { workoutId } },
  });
  if (!set) return actionError("Serie no encontrada");

  await prisma.workoutSet.delete({ where: { id: setId } });
  return actionSuccess(undefined);
}

export async function addExtraSet(workoutExerciseId: string) {
  const user = await requireUser();

  const we = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workout: { userId: user.id, status: "IN_PROGRESS" },
    },
    include: { sets: true, routineExercise: true },
  });
  if (!we) return actionError("Ejercicio no encontrado");

  const maxSet = we.sets.reduce((max, s) => Math.max(max, s.setNumber), 0);
  const nextSetNumber = maxSet + 1;

  const nextSets = Math.max(we.targetSets, nextSetNumber);

  await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: { targetSets: nextSets },
  });

  if (we.routineExerciseId) {
    await prisma.routineExercise.update({
      where: { id: we.routineExerciseId },
      data: {
        sets: Math.max(we.routineExercise?.sets ?? we.targetSets, nextSetNumber),
      },
    });
  }

  return actionSuccess({ setNumber: nextSetNumber });
}

export async function skipExercise(workoutExerciseId: string) {
  const user = await requireUser();

  const we = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workout: { userId: user.id, status: "IN_PROGRESS" },
    },
  });
  if (!we) return actionError("Ejercicio no encontrado");

  await prisma.workoutExercise.update({
    where: { id: workoutExerciseId },
    data: { skipped: true },
  });

  return actionSuccess(undefined);
}

export async function swapWorkoutExercise(
  workoutExerciseId: string,
  newExerciseId: string,
) {
  const user = await requireUser();

  const parsed = swapWorkoutExerciseSchema.safeParse({
    workoutExerciseId,
    newExerciseId,
  });
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const we = await prisma.workoutExercise.findFirst({
    where: {
      id: parsed.data.workoutExerciseId,
      workout: { userId: user.id, status: "IN_PROGRESS" },
    },
  });
  if (!we) return actionError("Ejercicio no encontrado");

  if (we.exerciseId === parsed.data.newExerciseId) {
    return actionError("Ya estás usando este ejercicio");
  }

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: parsed.data.newExerciseId,
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
  });
  if (!exercise) return actionError("Ejercicio no encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.workoutSet.deleteMany({
      where: { workoutExerciseId: parsed.data.workoutExerciseId },
    });

    await tx.workoutExercise.update({
      where: { id: parsed.data.workoutExerciseId },
      data: { exerciseId: parsed.data.newExerciseId },
    });
  });

  revalidatePath(`/train/${we.workoutId}`);
  return actionSuccess(undefined);
}

export async function finishWorkout(workoutId: string) {
  const user = await requireUser();

  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id, status: "IN_PROGRESS" },
    include: workoutInclude,
  });
  if (!workout) return actionError("Entrenamiento no encontrado");

  const completedAt = new Date();
  const durationSeconds = Math.floor(
    (completedAt.getTime() - workout.startedAt.getTime()) / 1000,
  );

  await prisma.workout.update({
    where: { id: workoutId },
    data: {
      status: "COMPLETED",
      completedAt,
      durationSeconds,
    },
  });

  const progressionResults = computeWorkoutProgressionResults(workout.exercises);

  revalidatePath("/history");
  revalidatePath("/dashboard");
  revalidatePath("/train");

  const totalSets = workout.exercises.reduce(
    (acc, we) => acc + we.sets.length,
    0,
  );
  const totalVolume = workout.exercises.reduce(
    (acc, we) =>
      acc +
      calculateVolume(
        we.sets.map((s) => ({ weight: Number(s.weight), reps: s.reps })),
      ),
    0,
  );

  return actionSuccess({
    durationSeconds,
    totalSets,
    totalVolume,
    progressionResults,
  });
}

export async function getRoutineStartHints(routineId: string) {
  const user = await requireUser();

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: user.id },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });
  if (!routine) return [];

  const previousWorkout = await prisma.workout.findFirst({
    where: {
      userId: user.id,
      routineId,
      status: "COMPLETED",
    },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  const previousBySlot = new Map<
    string,
    { weight: number; reps: number }[]
  >();

  if (previousWorkout) {
    for (const we of previousWorkout.exercises) {
      if (we.skipped || we.sets.length === 0 || !we.routineExerciseId) continue;

      previousBySlot.set(
        we.routineExerciseId,
        we.sets.map((s) => ({
          weight: Number(s.weight),
          reps: s.reps,
        })),
      );
    }
  }

  return computeStartTrainingHints(
    routine.exercises.map((slot) => ({
      exerciseName: slot.exercise.name,
      repsMin: slot.repsMin,
      repsMax: slot.repsMax,
      loadProgression: slot.loadProgression,
      previousSets: previousBySlot.get(slot.id),
    })),
  );
}

export async function cancelWorkout(workoutId: string) {
  const user = await requireUser();

  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id, status: "IN_PROGRESS" },
  });
  if (!workout) return actionError("Entrenamiento no encontrado");

  await prisma.workout.update({
    where: { id: workoutId },
    data: { status: "CANCELLED", completedAt: new Date() },
  });

  revalidatePath("/train");
  return actionSuccess(undefined);
}

export async function getDashboardStats() {
  const user = await requireUser();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [lastWorkout, latestRoutine, weekCount, recentExercises] =
    await Promise.all([
      prisma.workout.findFirst({
        where: { userId: user.id, status: "COMPLETED" },
        include: { routine: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.routine.findFirst({
        where: { userId: user.id, isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.workout.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
          date: { gte: weekStart },
        },
      }),
      prisma.workoutExercise.findMany({
        where: { workout: { userId: user.id, status: "COMPLETED" } },
        include: { exercise: { select: { name: true, id: true } } },
        orderBy: { workout: { date: "desc" } },
        take: 20,
        distinct: ["exerciseId"],
      }),
    ]);

  const lastUsedRoutine = lastWorkout
    ? await prisma.routine.findFirst({
        where: { id: lastWorkout.routineId, userId: user.id },
      })
    : null;

  return {
    lastWorkout,
    latestRoutine,
    lastUsedRoutine,
    weekCount,
    recentExercises: recentExercises.map((e) => e.exercise),
  };
}
