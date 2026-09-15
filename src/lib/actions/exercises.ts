"use server";

import { revalidatePath } from "next/cache";
import { requireUser, actionError, actionSuccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exerciseSchema } from "@/lib/validations/exercise";

export async function getExercises() {
  const user = await requireUser();

  return prisma.exercise.findMany({
    where: {
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
    orderBy: { name: "asc" },
  });
}

export async function getExerciseById(id: string) {
  const user = await requireUser();

  const exercise = await prisma.exercise.findFirst({
    where: {
      id,
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
  });

  if (!exercise) return null;

  const history = await prisma.workoutSet.findMany({
    where: {
      workoutExercise: {
        exerciseId: id,
        workout: { userId: user.id, status: "COMPLETED" },
      },
    },
    include: {
      workoutExercise: {
        include: {
          workout: { select: { date: true, id: true } },
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return { exercise, history };
}

export async function createExercise(formData: FormData) {
  const user = await requireUser();

  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    muscleGroup: formData.get("muscleGroup") || undefined,
    defaultRepRange: formData.get("defaultRepRange") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const exercise = await prisma.exercise.create({
    data: { ...parsed.data, userId: user.id },
  });

  revalidatePath("/routines");
  return actionSuccess(exercise);
}

export async function updateExercise(id: string, formData: FormData) {
  const user = await requireUser();

  const existing = await prisma.exercise.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return actionError("Ejercicio no encontrado");

  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    muscleGroup: formData.get("muscleGroup") || undefined,
    defaultRepRange: formData.get("defaultRepRange") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const exercise = await prisma.exercise.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/routines");
  return actionSuccess(exercise);
}

export async function deleteExercise(id: string) {
  const user = await requireUser();

  const existing = await prisma.exercise.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return actionError("Ejercicio no encontrado");

  const inUse = await prisma.routineExercise.count({
    where: { exerciseId: id },
  });
  if (inUse > 0) {
    return actionError("No se puede eliminar: está en uso en rutinas");
  }

  await prisma.exercise.delete({ where: { id } });
  revalidatePath("/routines");
  return actionSuccess(undefined);
}
