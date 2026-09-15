"use server";

import { revalidatePath } from "next/cache";
import { requireUser, actionError, actionSuccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routineSchema, routineExerciseSchema } from "@/lib/validations/routine";

const routineInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: true,
      supersetGroup: true,
    },
  },
};

export async function getRoutines() {
  const user = await requireUser();

  return prisma.routine.findMany({
    where: { userId: user.id },
    include: {
      exercises: { include: { exercise: true } },
      _count: { select: { workouts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRoutineById(id: string) {
  const user = await requireUser();

  return prisma.routine.findFirst({
    where: { id, userId: user.id },
    include: routineInclude,
  });
}

export async function createRoutine(formData: FormData) {
  const user = await requireUser();

  const parsed = routineSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const routine = await prisma.routine.create({
    data: { ...parsed.data, userId: user.id },
  });

  revalidatePath("/routines");
  return actionSuccess(routine);
}

export async function updateRoutine(id: string, formData: FormData) {
  const user = await requireUser();

  const existing = await prisma.routine.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return actionError("Rutina no encontrada");

  const parsed = routineSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const routine = await prisma.routine.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/routines");
  revalidatePath(`/routines/${id}`);
  return actionSuccess(routine);
}

export async function toggleRoutineActive(id: string) {
  const user = await requireUser();

  const existing = await prisma.routine.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return actionError("Rutina no encontrada");

  const routine = await prisma.routine.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath("/routines");
  return actionSuccess(routine);
}

export async function deleteRoutine(id: string) {
  const user = await requireUser();

  const existing = await prisma.routine.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return actionError("Rutina no encontrada");

  const workoutCount = await prisma.workout.count({
    where: { routineId: id },
  });
  if (workoutCount > 0) {
    return actionError("No se puede eliminar: tiene entrenamientos registrados");
  }

  await prisma.routine.delete({ where: { id } });
  revalidatePath("/routines");
  return actionSuccess(undefined);
}

export async function duplicateRoutine(id: string) {
  const user = await requireUser();

  const original = await prisma.routine.findFirst({
    where: { id, userId: user.id },
    include: {
      exercises: true,
      supersetGroups: true,
    },
  });
  if (!original) return actionError("Rutina no encontrada");

  const groupIdMap = new Map<string, string>();

  const newRoutine = await prisma.$transaction(async (tx) => {
    const routine = await tx.routine.create({
      data: {
        userId: user.id,
        name: `${original.name} (copia)`,
        description: original.description,
        isActive: true,
      },
    });

    for (const group of original.supersetGroups) {
      const newGroup = await tx.supersetGroup.create({
        data: {
          routineId: routine.id,
          userId: user.id,
          label: group.label,
        },
      });
      groupIdMap.set(group.id, newGroup.id);
    }

    for (const ex of original.exercises) {
      await tx.routineExercise.create({
        data: {
          routineId: routine.id,
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          isOptional: ex.isOptional,
          loadProgression: ex.loadProgression,
          supersetGroupId: ex.supersetGroupId
            ? groupIdMap.get(ex.supersetGroupId)
            : null,
          supersetOrder: ex.supersetOrder,
        },
      });
    }

    return routine;
  });

  revalidatePath("/routines");
  return actionSuccess(newRoutine);
}

export async function addExerciseToRoutine(
  routineId: string,
  data: {
    exerciseId: string;
    sets?: number;
    repsMin?: number;
    repsMax?: number;
    restSeconds?: number;
    notes?: string;
  },
) {
  const user = await requireUser();

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: user.id },
    include: { exercises: { orderBy: { order: "desc" }, take: 1 } },
  });
  if (!routine) return actionError("Rutina no encontrada");

  const exercise = await prisma.exercise.findFirst({
    where: {
      id: data.exerciseId,
      OR: [{ userId: user.id }, { isGlobal: true }],
    },
  });
  if (!exercise) return actionError("Ejercicio no encontrado");

  const maxOrder = routine.exercises[0]?.order ?? 0;

  const parsed = routineExerciseSchema.safeParse({
    exerciseId: data.exerciseId,
    sets: data.sets ?? 3,
    repsMin: data.repsMin ?? 8,
    repsMax: data.repsMax ?? 12,
    restSeconds: data.restSeconds ?? 90,
    notes: data.notes,
    isOptional: false,
    loadProgression: true,
  });

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const routineExercise = await prisma.routineExercise.create({
    data: {
      routineId,
      order: maxOrder + 1,
      ...parsed.data,
    },
    include: { exercise: true },
  });

  revalidatePath(`/routines/${routineId}`);
  return actionSuccess(routineExercise);
}

export async function updateRoutineExercise(
  routineExerciseId: string,
  data: {
    sets?: number;
    repsMin?: number;
    repsMax?: number;
    restSeconds?: number;
    notes?: string;
    isOptional?: boolean;
    loadProgression?: boolean;
  },
) {
  const user = await requireUser();

  const existing = await prisma.routineExercise.findFirst({
    where: { id: routineExerciseId, routine: { userId: user.id } },
  });
  if (!existing) return actionError("Ejercicio no encontrado");

  const routineExercise = await prisma.routineExercise.update({
    where: { id: routineExerciseId },
    data,
    include: { exercise: true },
  });

  revalidatePath(`/routines/${existing.routineId}`);
  return actionSuccess(routineExercise);
}

export async function removeExerciseFromRoutine(routineExerciseId: string) {
  const user = await requireUser();

  const existing = await prisma.routineExercise.findFirst({
    where: { id: routineExerciseId, routine: { userId: user.id } },
    include: { supersetGroup: true },
  });
  if (!existing) return actionError("Ejercicio no encontrado");

  await prisma.$transaction(async (tx) => {
    await tx.routineExercise.delete({ where: { id: routineExerciseId } });

    if (existing.supersetGroupId) {
      const remaining = await tx.routineExercise.count({
        where: { supersetGroupId: existing.supersetGroupId },
      });
      if (remaining === 0) {
        await tx.supersetGroup.delete({
          where: { id: existing.supersetGroupId },
        });
      } else if (remaining === 1) {
        await tx.routineExercise.updateMany({
          where: { supersetGroupId: existing.supersetGroupId },
          data: { supersetGroupId: null, supersetOrder: null },
        });
        await tx.supersetGroup.delete({
          where: { id: existing.supersetGroupId },
        });
      }
    }

    const remainingExercises = await tx.routineExercise.findMany({
      where: { routineId: existing.routineId },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < remainingExercises.length; i++) {
      await tx.routineExercise.update({
        where: { id: remainingExercises[i].id },
        data: { order: i + 1 },
      });
    }
  });

  revalidatePath(`/routines/${existing.routineId}`);
  return actionSuccess(undefined);
}

export async function reorderRoutineExercises(
  routineId: string,
  orderedIds: string[],
) {
  const user = await requireUser();

  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId: user.id },
    include: { exercises: true },
  });
  if (!routine) return actionError("Rutina no encontrada");

  const existingIds = new Set(routine.exercises.map((e) => e.id));
  if (
    orderedIds.length !== routine.exercises.length ||
    !orderedIds.every((id) => existingIds.has(id))
  ) {
    return actionError("Orden inválido");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.routineExercise.update({
        where: { id },
        data: { order: index + 1 },
      }),
    ),
  );

  revalidatePath(`/routines/${routineId}`);
  return actionSuccess(undefined);
}

export async function moveRoutineExercise(
  routineExerciseId: string,
  direction: "up" | "down",
) {
  const user = await requireUser();

  const current = await prisma.routineExercise.findFirst({
    where: { id: routineExerciseId, routine: { userId: user.id } },
  });
  if (!current) return actionError("Ejercicio no encontrado");

  const swap = await prisma.routineExercise.findFirst({
    where: {
      routineId: current.routineId,
      order: direction === "up" ? current.order - 1 : current.order + 1,
    },
  });
  if (!swap) return actionSuccess(undefined);

  await prisma.$transaction([
    prisma.routineExercise.update({
      where: { id: current.id },
      data: { order: swap.order },
    }),
    prisma.routineExercise.update({
      where: { id: swap.id },
      data: { order: current.order },
    }),
  ]);

  revalidatePath(`/routines/${current.routineId}`);
  return actionSuccess(undefined);
}

export async function combineExercises(
  routineExerciseId: string,
  targetRoutineExerciseId: string,
) {
  const user = await requireUser();

  const [source, target] = await Promise.all([
    prisma.routineExercise.findFirst({
      where: { id: routineExerciseId, routine: { userId: user.id } },
    }),
    prisma.routineExercise.findFirst({
      where: { id: targetRoutineExerciseId, routine: { userId: user.id } },
    }),
  ]);

  if (!source || !target) return actionError("Ejercicio no encontrado");
  if (source.routineId !== target.routineId) {
    return actionError("Los ejercicios deben estar en la misma rutina");
  }
  if (source.id === target.id) return actionError("No puedes combinar un ejercicio consigo mismo");

  await prisma.$transaction(async (tx) => {
    let groupId = source.supersetGroupId ?? target.supersetGroupId;

    if (!groupId) {
      const group = await tx.supersetGroup.create({
        data: {
          routineId: source.routineId,
          userId: user.id,
        },
      });
      groupId = group.id;
    }

    const inGroup = await tx.routineExercise.findMany({
      where: { supersetGroupId: groupId },
      orderBy: { supersetOrder: "asc" },
    });

    const toAdd = [source, target].filter(
      (e) => !inGroup.some((g) => g.id === e.id),
    );

    const allMembers = [...inGroup];
    for (const ex of toAdd) {
      if (!allMembers.some((m) => m.id === ex.id)) allMembers.push(ex);
    }

    allMembers.sort((a, b) => a.order - b.order);

    for (let i = 0; i < allMembers.length; i++) {
      await tx.routineExercise.update({
        where: { id: allMembers[i].id },
        data: { supersetGroupId: groupId, supersetOrder: i + 1 },
      });
    }
  });

  revalidatePath(`/routines/${source.routineId}`);
  return actionSuccess(undefined);
}

export async function removeFromSuperset(routineExerciseId: string) {
  const user = await requireUser();

  const existing = await prisma.routineExercise.findFirst({
    where: { id: routineExerciseId, routine: { userId: user.id } },
  });
  if (!existing || !existing.supersetGroupId) {
    return actionError("Ejercicio no está en un superset");
  }

  const groupId = existing.supersetGroupId;

  await prisma.$transaction(async (tx) => {
    await tx.routineExercise.update({
      where: { id: routineExerciseId },
      data: { supersetGroupId: null, supersetOrder: null },
    });

    const remaining = await tx.routineExercise.findMany({
      where: { supersetGroupId: groupId },
      orderBy: { supersetOrder: "asc" },
    });

    if (remaining.length <= 1) {
      if (remaining.length === 1) {
        await tx.routineExercise.update({
          where: { id: remaining[0].id },
          data: { supersetGroupId: null, supersetOrder: null },
        });
      }
      await tx.supersetGroup.delete({ where: { id: groupId } });
    } else {
      for (let i = 0; i < remaining.length; i++) {
        await tx.routineExercise.update({
          where: { id: remaining[i].id },
          data: { supersetOrder: i + 1 },
        });
      }
    }
  });

  revalidatePath(`/routines/${existing.routineId}`);
  return actionSuccess(undefined);
}
