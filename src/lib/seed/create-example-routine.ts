import { prisma } from "@/lib/prisma";

const TORSO_A_EXERCISES = [
  { name: "Press banca", sets: 4, repsMin: 6, repsMax: 8, restSeconds: 90 },
  { name: "Jalón al pecho", sets: 4, repsMin: 8, repsMax: 10, restSeconds: 90 },
  { name: "Press inclinado", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
  { name: "Remo", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90 },
  {
    name: "Elevaciones laterales",
    sets: 4,
    repsMin: 12,
    repsMax: 15,
    restSeconds: 90,
  },
  { name: "Extensión tríceps", sets: 4, repsMin: 12, repsMax: 15, restSeconds: 90 },
  { name: "Ab wheel", sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60 },
];

const SUPERSET_PAIRS = [
  ["Press banca", "Jalón al pecho"],
  ["Press inclinado", "Remo"],
  ["Elevaciones laterales", "Extensión tríceps"],
];

export async function createExampleRoutineForUser(userId: string) {
  const existing = await prisma.routine.findFirst({
    where: { userId, name: "Torso A" },
  });
  if (existing) return existing;

  const exerciseMap = new Map<string, string>();

  for (const config of TORSO_A_EXERCISES) {
    let exercise = await prisma.exercise.findFirst({
      where: { name: config.name, OR: [{ isGlobal: true }, { userId }] },
    });

    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          name: config.name,
          userId,
          muscleGroup: "General",
        },
      });
    }

    exerciseMap.set(config.name, exercise.id);
  }

  return prisma.$transaction(async (tx) => {
    const routine = await tx.routine.create({
      data: {
        userId,
        name: "Torso A",
        description: "Rutina de ejemplo para torso",
        isActive: true,
      },
    });

    const routineExerciseIds = new Map<string, string>();

    for (let i = 0; i < TORSO_A_EXERCISES.length; i++) {
      const config = TORSO_A_EXERCISES[i];
      const re = await tx.routineExercise.create({
        data: {
          routineId: routine.id,
          exerciseId: exerciseMap.get(config.name)!,
          order: i + 1,
          sets: config.sets,
          repsMin: config.repsMin,
          repsMax: config.repsMax,
          restSeconds: config.restSeconds,
        },
      });
      routineExerciseIds.set(config.name, re.id);
    }

    for (const [first, second] of SUPERSET_PAIRS) {
      const group = await tx.supersetGroup.create({
        data: { routineId: routine.id, userId },
      });

      await tx.routineExercise.update({
        where: { id: routineExerciseIds.get(first)! },
        data: { supersetGroupId: group.id, supersetOrder: 1 },
      });
      await tx.routineExercise.update({
        where: { id: routineExerciseIds.get(second)! },
        data: { supersetGroupId: group.id, supersetOrder: 2 },
      });
    }

    return routine;
  });
}
