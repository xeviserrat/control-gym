import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GLOBAL_EXERCISES = [
  { name: "Press banca", muscleGroup: "Pecho" },
  { name: "Press inclinado", muscleGroup: "Pecho" },
  { name: "Jalón al pecho", muscleGroup: "Espalda" },
  { name: "Remo", muscleGroup: "Espalda" },
  { name: "Dominadas", muscleGroup: "Espalda" },
  { name: "Sentadilla", muscleGroup: "Piernas" },
  { name: "Hack squat", muscleGroup: "Piernas" },
  { name: "Peso muerto", muscleGroup: "Piernas" },
  { name: "Hip thrust", muscleGroup: "Piernas" },
  { name: "Curl femoral", muscleGroup: "Piernas" },
  { name: "Extensión de cuádriceps", muscleGroup: "Piernas" },
  { name: "Elevaciones laterales", muscleGroup: "Hombros" },
  { name: "Press militar", muscleGroup: "Hombros" },
  { name: "Curl bíceps", muscleGroup: "Bíceps" },
  { name: "Extensión tríceps", muscleGroup: "Tríceps" },
  { name: "Ab wheel", muscleGroup: "Core" },
  { name: "Crunch", muscleGroup: "Core" },
  { name: "Plancha", muscleGroup: "Core" },
];

async function main() {
  console.log("Seeding global exercises...");

  for (const ex of GLOBAL_EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, isGlobal: true },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          isGlobal: true,
        },
      });
    }
  }

  console.log(`Seeded ${GLOBAL_EXERCISES.length} global exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
