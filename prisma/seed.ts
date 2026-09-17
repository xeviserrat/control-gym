import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GLOBAL_EXERCISES = [
  // Pecho
  { name: "Press banca", muscleGroup: "Pecho" },
  { name: "Press banca en multipower", muscleGroup: "Pecho" },
  { name: "Press banca en máquina de pie", muscleGroup: "Pecho" },
  { name: "Press banca inclinado", muscleGroup: "Pecho" },
  { name: "Press banca inclinado en multipower", muscleGroup: "Pecho" },
  { name: "Press banca inclinado con mancuernas", muscleGroup: "Pecho" },
  { name: "Press declinado", muscleGroup: "Pecho" },
  { name: "Press inclinado", muscleGroup: "Pecho" },
  { name: "Aperturas con mancuernas", muscleGroup: "Pecho" },
  { name: "Aperturas en polea", muscleGroup: "Pecho" },
  { name: "Cruce de poleas", muscleGroup: "Pecho" },
  { name: "Pec deck", muscleGroup: "Pecho" },
  { name: "Fondos en paralelas", muscleGroup: "Pecho" },
  { name: "Pull-over en polea alta", muscleGroup: "Pecho" },

  // Espalda
  { name: "Jalón al pecho", muscleGroup: "Espalda" },
  { name: "Jalón al pecho agarre neutro", muscleGroup: "Espalda" },
  { name: "Jalón al pecho agarre supino", muscleGroup: "Espalda" },
  { name: "Remo con barra", muscleGroup: "Espalda" },
  { name: "Remo", muscleGroup: "Espalda" },
  { name: "Remo con mancuerna", muscleGroup: "Espalda" },
  { name: "Remo en máquina", muscleGroup: "Espalda" },
  { name: "Remo en polea baja", muscleGroup: "Espalda" },
  { name: "Remo en T", muscleGroup: "Espalda" },
  { name: "Dominadas", muscleGroup: "Espalda" },
  { name: "Dominadas asistidas", muscleGroup: "Espalda" },
  { name: "Face pull", muscleGroup: "Espalda" },
  { name: "Hiperextensiones", muscleGroup: "Espalda" },
  { name: "Pull-over con mancuerna", muscleGroup: "Espalda" },

  // Piernas
  { name: "Sentadilla con barra", muscleGroup: "Piernas" },
  { name: "Sentadilla", muscleGroup: "Piernas" },
  { name: "Sentadilla en multipower", muscleGroup: "Piernas" },
  { name: "Sentadilla frontal", muscleGroup: "Piernas" },
  { name: "Sentadilla búlgara", muscleGroup: "Piernas" },
  { name: "Hack squat", muscleGroup: "Piernas" },
  { name: "Prensa de piernas", muscleGroup: "Piernas" },
  { name: "Peso muerto", muscleGroup: "Piernas" },
  { name: "Peso muerto convencional", muscleGroup: "Piernas" },
  { name: "Peso muerto rumano", muscleGroup: "Piernas" },
  { name: "Peso muerto sumo", muscleGroup: "Piernas" },
  { name: "Hip thrust", muscleGroup: "Piernas" },
  { name: "Curl femoral", muscleGroup: "Piernas" },
  { name: "Curl femoral tumbado", muscleGroup: "Piernas" },
  { name: "Curl femoral sentado", muscleGroup: "Piernas" },
  { name: "Extensión de cuádriceps", muscleGroup: "Piernas" },
  { name: "Zancadas con mancuernas", muscleGroup: "Piernas" },
  { name: "Zancadas caminando", muscleGroup: "Piernas" },
  { name: "Elevación de gemelos de pie", muscleGroup: "Piernas" },
  { name: "Elevación de gemelos sentado", muscleGroup: "Piernas" },
  { name: "Abducción de cadera", muscleGroup: "Piernas" },
  { name: "Aducción de cadera", muscleGroup: "Piernas" },

  // Hombros
  { name: "Press militar", muscleGroup: "Hombros" },
  { name: "Press militar con barra", muscleGroup: "Hombros" },
  { name: "Press militar en multipower", muscleGroup: "Hombros" },
  { name: "Press Arnold", muscleGroup: "Hombros" },
  { name: "Elevaciones laterales", muscleGroup: "Hombros" },
  { name: "Elevaciones frontales", muscleGroup: "Hombros" },
  { name: "Pájaros", muscleGroup: "Hombros" },
  { name: "Remo al mentón", muscleGroup: "Hombros" },

  // Bíceps
  { name: "Curl bíceps", muscleGroup: "Bíceps" },
  { name: "Curl bíceps con barra", muscleGroup: "Bíceps" },
  { name: "Curl bíceps con mancuernas", muscleGroup: "Bíceps" },
  { name: "Curl bíceps en polea", muscleGroup: "Bíceps" },
  { name: "Curl martillo", muscleGroup: "Bíceps" },
  { name: "Curl predicador", muscleGroup: "Bíceps" },
  { name: "Curl concentrado", muscleGroup: "Bíceps" },

  // Tríceps
  { name: "Extensión tríceps", muscleGroup: "Tríceps" },
  { name: "Extensión de tríceps en polea", muscleGroup: "Tríceps" },
  { name: "Extensión de tríceps sobre cabeza", muscleGroup: "Tríceps" },
  { name: "Fondos en banco", muscleGroup: "Tríceps" },
  { name: "Press francés", muscleGroup: "Tríceps" },
  { name: "Patada de tríceps", muscleGroup: "Tríceps" },
  { name: "Extensión de tríceps en máquina", muscleGroup: "Tríceps" },

  // Core
  { name: "Ab wheel", muscleGroup: "Core" },
  { name: "Crunch", muscleGroup: "Core" },
  { name: "Plancha", muscleGroup: "Core" },
  { name: "Elevación de piernas colgado", muscleGroup: "Core" },
  { name: "Dead bug", muscleGroup: "Core" },
  { name: "Russian twist", muscleGroup: "Core" },

  // Cardio
  { name: "Cinta", muscleGroup: "Cardio" },
  { name: "Bici estática", muscleGroup: "Cardio" },
  { name: "Elíptica", muscleGroup: "Cardio" },
  { name: "Remo ergómetro", muscleGroup: "Cardio" },
];

async function main() {
  console.log("Seeding global exercises...");

  let created = 0;
  let skipped = 0;

  for (const ex of GLOBAL_EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name, isGlobal: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        isGlobal: true,
      },
    });
    created++;
  }

  console.log(
    `Done: ${created} created, ${skipped} already existed (${GLOBAL_EXERCISES.length} total in catalog).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
